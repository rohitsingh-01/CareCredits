#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Caregiver,
    Goal,
    Token,
    Raised,
    Withdrawn,
}

#[contract]
pub struct CareFundPool;

#[contractimpl]
impl CareFundPool {
    pub fn initialize(env: Env, caregiver: Address, admin: Address, goal: i128, token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        if goal <= 0 {
            panic!("goal must be positive");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Caregiver, &caregiver);
        env.storage().instance().set(&DataKey::Goal, &goal);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Raised, &0i128);
        env.storage().instance().set(&DataKey::Withdrawn, &0i128);
        env.storage().instance().extend_ttl(100, 518400);
    }

    pub fn contribute(env: Env, contributor: Address, amount: i128) -> i128 {
        contributor.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let raised: i128 = env.storage().instance().get(&DataKey::Raised).unwrap_or(0);

        // Transfer tokens from contributor to contract
        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(&contributor, &env.current_contract_address(), &amount);

        let new_raised = raised + amount;
        env.storage().instance().set(&DataKey::Raised, &new_raised);
        env.storage().instance().extend_ttl(100, 518400);

        // Emit contrib event
        env.events().publish(
            (symbol_short!("contrib"), contributor),
            (amount, new_raised),
        );

        new_raised
    }

    pub fn withdraw(env: Env, caregiver: Address) -> i128 {
        caregiver.require_auth();
        let care: Address = env.storage().instance().get(&DataKey::Caregiver).unwrap();
        if caregiver != care {
            panic!("only caregiver can withdraw");
        }

        let raised: i128 = env.storage().instance().get(&DataKey::Raised).unwrap_or(0);
        let withdrawn: i128 = env.storage().instance().get(&DataKey::Withdrawn).unwrap_or(0);
        let withdrawable = raised - withdrawn;

        if withdrawable <= 0 {
            panic!("no funds available to withdraw");
        }

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &caregiver, &withdrawable);

        let new_withdrawn = withdrawn + withdrawable;
        env.storage().instance().set(&DataKey::Withdrawn, &new_withdrawn);
        env.storage().instance().extend_ttl(100, 518400);

        // Emit withdraw event
        env.events().publish(
            (symbol_short!("withdraw"), caregiver),
            withdrawable,
        );

        withdrawable
    }

    pub fn total_raised(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Raised).unwrap_or(0)
    }

    pub fn goal(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Goal).unwrap_or(0)
    }

    pub fn caregiver(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Caregiver).unwrap()
    }

    pub fn is_goal_reached(env: Env) -> bool {
        let raised = Self::total_raised(env.clone());
        let goal = Self::goal(env);
        raised >= goal
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_contribute_and_withdraw() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let caregiver = Address::generate(&env);
        let contributor_1 = Address::generate(&env);
        let contributor_2 = Address::generate(&env);

        // Register the Stellar Asset Contract (native XLM SAC test double)
        let token_address = env.register_stellar_asset_contract_v2(admin.clone()).address();
        let token_client = soroban_sdk::token::Client::new(&env, &token_address);
        let token_admin = soroban_sdk::token::StellarAssetContractClient::new(&env, &token_address);

        // Fund contributors
        token_admin.mint(&contributor_1, &1000);
        token_admin.mint(&contributor_2, &500);

        // Register and initialize contract
        let contract_id = env.register(CareFundPool, ());
        let client = CareFundPoolClient::new(&env, &contract_id);
        client.initialize(&caregiver, &admin, &1200, &token_address);

        assert_eq!(client.goal(), 1200);
        assert_eq!(client.caregiver(), caregiver);
        assert_eq!(client.total_raised(), 0);
        assert_eq!(client.is_goal_reached(), false);

        // Contributor 1 contributes 800
        let raised = client.contribute(&contributor_1, &800);
        assert_eq!(raised, 800);
        assert_eq!(client.total_raised(), 800);
        assert_eq!(client.is_goal_reached(), false);
        assert_eq!(token_client.balance(&contributor_1), 200);
        assert_eq!(token_client.balance(&contract_id), 800);

        // Contributor 2 contributes 400
        let raised = client.contribute(&contributor_2, &400);
        assert_eq!(raised, 1200);
        assert_eq!(client.total_raised(), 1200);
        assert_eq!(client.is_goal_reached(), true);
        assert_eq!(token_client.balance(&contributor_2), 100);
        assert_eq!(token_client.balance(&contract_id), 1200);

        // Caregiver withdraws
        let withdrawn = client.withdraw(&caregiver);
        assert_eq!(withdrawn, 1200);
        assert_eq!(token_client.balance(&caregiver), 1200);
        assert_eq!(token_client.balance(&contract_id), 0);
    }

    #[test]
    #[should_panic(expected = "only caregiver can withdraw")]
    fn test_non_caregiver_cannot_withdraw() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let caregiver = Address::generate(&env);
        let attacker = Address::generate(&env);
        let contributor = Address::generate(&env);

        let token_address = env.register_stellar_asset_contract_v2(admin.clone()).address();
        let token_admin = soroban_sdk::token::StellarAssetContractClient::new(&env, &token_address);
        token_admin.mint(&contributor, &500);

        let contract_id = env.register(CareFundPool, ());
        let client = CareFundPoolClient::new(&env, &contract_id);
        client.initialize(&caregiver, &admin, &1000, &token_address);

        client.contribute(&contributor, &500);

        // Attacker attempts to withdraw
        client.withdraw(&attacker);
    }

    #[test]
    #[should_panic(expected = "no funds available to withdraw")]
    fn test_cannot_withdraw_twice_without_new_funds() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let caregiver = Address::generate(&env);
        let contributor = Address::generate(&env);

        let token_address = env.register_stellar_asset_contract_v2(admin.clone()).address();
        let token_admin = soroban_sdk::token::StellarAssetContractClient::new(&env, &token_address);
        token_admin.mint(&contributor, &500);

        let contract_id = env.register(CareFundPool, ());
        let client = CareFundPoolClient::new(&env, &contract_id);
        client.initialize(&caregiver, &admin, &1000, &token_address);

        client.contribute(&contributor, &500);

        // First withdraw succeeds
        client.withdraw(&caregiver);

        // Second withdraw should panic
        client.withdraw(&caregiver);
    }
}
