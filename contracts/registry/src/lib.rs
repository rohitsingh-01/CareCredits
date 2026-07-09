#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Verified(Address),
    Paused(Address),
}

#[contract]
pub struct CareRegistry;

#[contractimpl]
impl CareRegistry {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().extend_ttl(100, 518400);
    }

    pub fn set_verified(env: Env, admin: Address, caregiver: Address, verified: bool) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "only admin can set verified status");

        env.storage().persistent().set(&DataKey::Verified(caregiver.clone()), &verified);
        env.storage().persistent().extend_ttl(&DataKey::Verified(caregiver.clone()), 100, 518400);

        // Emit event
        env.events().publish(
            (symbol_short!("verified"), caregiver),
            verified,
        );
    }

    pub fn set_paused(env: Env, admin: Address, caregiver: Address, paused: bool) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert_eq!(admin, stored_admin, "only admin can set paused status");

        env.storage().persistent().set(&DataKey::Paused(caregiver.clone()), &paused);
        env.storage().persistent().extend_ttl(&DataKey::Paused(caregiver.clone()), 100, 518400);

        // Emit event
        env.events().publish(
            (symbol_short!("paused"), caregiver),
            paused,
        );
    }

    pub fn is_verified(env: Env, caregiver: Address) -> bool {
        env.storage().persistent().get(&DataKey::Verified(caregiver)).unwrap_or(false)
    }

    pub fn is_paused(env: Env, caregiver: Address) -> bool {
        env.storage().persistent().get(&DataKey::Paused(caregiver)).unwrap_or(false)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_verify_and_pause() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let caregiver = Address::generate(&env);

        let contract_id = env.register(CareRegistry, ());
        let client = CareRegistryClient::new(&env, &contract_id);
        client.initialize(&admin);

        assert_eq!(client.is_verified(&caregiver), false);
        assert_eq!(client.is_paused(&caregiver), false);

        client.set_verified(&admin, &caregiver, &true);
        assert_eq!(client.is_verified(&caregiver), true);

        client.set_paused(&admin, &caregiver, &true);
        assert_eq!(client.is_paused(&caregiver), true);

        client.set_paused(&admin, &caregiver, &false);
        assert_eq!(client.is_paused(&caregiver), false);
    }

    #[test]
    #[should_panic(expected = "only admin can set verified status")]
    fn test_non_admin_cannot_verify() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let attacker = Address::generate(&env);
        let caregiver = Address::generate(&env);

        let contract_id = env.register(CareRegistry, ());
        let client = CareRegistryClient::new(&env, &contract_id);
        client.initialize(&admin);

        client.set_verified(&attacker, &caregiver, &true);
    }

    #[test]
    fn test_initialize_requires_auth() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let contract_id = env.register(CareRegistry, ());
        let client = CareRegistryClient::new(&env, &contract_id);

        env.mock_all_auths();
        client.initialize(&admin);

        assert!(!env.auths().is_empty(), "initialization must be authorized");
        let auth = &env.auths()[0];
        assert_eq!(auth.0, admin);
    }
}
