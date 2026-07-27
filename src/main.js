import "./styles/style.css";
import "./lib/analytics.js";
import "./data/pools.js";
import "./components/onboarding.js";
import "./components/feedback.js";
import { initRouter } from "./router.js";

initRouter(document.getElementById("app"));
