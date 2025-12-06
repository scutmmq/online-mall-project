// 导入router组件
import { createRouter, createWebHistory } from 'vue-router';

// 导入view
import layoutView from "../views/layout/index.vue"
import userView from "../views/user/user.vue"
import loginView from "../views/login/login.vue"
import searchView from '@/views/search/search.vue';
import registView from "@/views/regist/regist.vue"
import userMainView from "@/views/user/main.vue"
import userAddressView from "@/views/user/address.vue"
import userProfileView from "@/views/user/profile.vue"
import userCartView from "@/views/user/cart.vue"
import userOrdersView from "@/views/user/orders.vue"
import modifyPdView from "@/views/user/modifyPd.vue"
import productView from '@/views/product/product.vue'
import cartView from '@/views/cart/cart.vue'
import favoriteView from '@/views/user/favorite.vue';
import followView from '@/views/user/follow.vue';
import userReviewsView from '@/views/user/reviews.vue'; // 导入用户评价页面
import merchantRegisterView from '@/views/merchant/register.vue';
import merchantView from '@/views/merchant/merchant.vue';
import Main from '@/views/merchant/main.vue';
import Products from '@/views/merchant/products.vue';
import Stock from '@/views/merchant/stock.vue';
import Profile from '@/views/merchant/profile.vue';
import Follows from '@/views/merchant/follows.vue';
import Address from '@/views/merchant/address.vue';
import inventoryLogView from '@/views/merchant/inventory-log.vue';
import Order from '@/views/order/order.vue';
import Orders from '@/views/merchant/orders.vue';
import MerchantReviews from '@/views/merchant/reviews.vue'; // 导入商家评价页面

// 创建路由
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "",
            redirect:"/home"
        },
        {
            path: "/home",
            name: "home",
            component:layoutView
        },

        {
            path: '/user',
            component: userView, // 父组件（包含侧边栏）
            children: [
            { path: 'main', component: userMainView },       // /user/main
            { path: 'orders', component: userOrdersView },   // /user/orders
            { path: 'profile', component: userProfileView }, // /user/profile
            { path: 'address', component: userAddressView },     // 地址管理组件
            { path: 'cart', component: cartView },           // 购物车组件
            { path:'password',component:modifyPdView},
            { path: '', redirect: '/user/main' },               // 默认进入我的首页
            { path: 'favorite', component: favoriteView },
            { path: 'follow', component: followView },
            { path: 'reviews', component: userReviewsView }      // 用户评价页面
            ]
        },

        
        {
            path: "/login",
            name: "login",
            component:loginView
        },
        {
            path: "/search",
            name: "search",
            component:searchView
        },
        {
            path: "/regist",
            name: "regist",
            component:registView
        },
        {
        path: '/product/:id', // 动态路由参数 id（对应 productId）
        name: 'ProductDetail',
        component: productView,
        props: true // 开启 props 传递，方便在组件中接收 id
        },
        {
            path: '/order/:orderId',
            component: Order,
            props:true
        },
        {
            path: '/cart',
            name: 'cart',
            component:cartView
        },
        {
            path: '/merchant/register',
            name:'merchantRegister',
            component:merchantRegisterView
        },
        {
            path: '/merchant',
            component: merchantView,
            children: [
                { path: 'main', component: Main },
                { path: '', redirect: '/merchant/main' },
                { path: 'products', component: Products },
                { path: 'stock', component: Stock },
                { path: 'profile', component: Profile },
                { path: 'follow', component: Follows },
                { path: 'address', component: Address },
                { path: "inventory", component: inventoryLogView },
                {path:"orders",component:Orders},
                {path:"reviews",component:MerchantReviews} // 商家评价页面
            ]
        }
    ]
})

export default router;