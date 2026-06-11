import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/auth";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
import Expired from "../components/Expired.vue";
import Analytics from "../views/Analytics.vue";
import AdminDashboard from "../views/AdminDashboard.vue";

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
	},
	{
		path: "/login",
		name: "Login",
		component: Login,
		meta: { requiresGuest: true },
	},
	{
		path: "/register",
		name: "Register",
		component: Register,
		meta: { requiresGuest: true },
	},
	{
		path: "/profile",
		name: "Profile",
		component: Profile,
		meta: { requiresAuth: true },
	},
	{
		path: "/analytics/:id?",
		name: "Analytics",
		component: Analytics,
		meta: { requiresAuth: true },
	},
	{
		path: "/admin",
		name: "AdminDashboard",
		component: AdminDashboard,
		meta: { requiresAuth: true, requiresAdmin: true },
	},
	{
		path: "/expired",
		name: "Expired",
		component: Expired,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

// Route guards
router.beforeEach((to, from, next) => {
	const authStore = useAuthStore();
	const isAuthenticated = authStore.isAuthenticated;

	// Nếu route yêu cầu admin
	if (to.meta.requiresAdmin) {
		if (!isAuthenticated) {
			next({
				name: "Login",
				query: { redirect: to.fullPath },
			});
		} else if (authStore.user?.role !== "admin") {
			next("/"); // Redirect về Home nếu không phải admin
		} else {
			next();
		}
	}
	// Nếu route yêu cầu authentication
	else if (to.meta.requiresAuth) {
		if (!isAuthenticated) {
			// Redirect về login
			next({
				name: "Login",
				query: { redirect: to.fullPath },
			});
		} else {
			next();
		}
	}
	// Nếu route chỉ cho guest (chưa login)
	else if (to.meta.requiresGuest) {
		if (isAuthenticated) {
			// Redirect về Home nếu đã login
			next("/");
		} else {
			next();
		}
	}
	// Route bình thường
	else {
		next();
	}
});

export default router;
