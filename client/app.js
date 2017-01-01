
/// <reference path="../typings/angularjs/angular.d.ts"/>
// Code goes here
 //module = angular.module('ezDirectives', ['ngFileUpload']);
 var app = angular.module('app', ['ngMaterial','ngMdIcons', 'ngAnimate', 'ngSanitize', 'ui.router',
      'ngStorage','ngFileUpload','ngImgCrop', 'ezDirectives','angular-cache','angularMoment',
      'cgBusy','sasrio.angular-material-sidenav']);
 app.constant("config",{
     appTitle:"easy collaborate",
     apiBaseUrl : "",
     themes : ['default','White-theme','light-blue','amber','cyan', 'light-green','lime','cool-blue']
  	
 })
 app.config([ "$httpProvider","$urlRouterProvider", '$stateProvider','$mdThemingProvider', 'CacheFactoryProvider', '$localStorageProvider','ssSideNavSectionsProvider',
 function($httpProvider, $urlRouterProvider, $stateProvider, $mdThemingProvider, CacheFactoryProvider, $localStorageProvider,ssSideNavSectionsProvider ){
   
   

   angular.extend(CacheFactoryProvider.defaults, { maxAge: 1 * 60 * 1000 });
   $localStorageProvider.setKeyPrefix("__cpadmin");

    // $mdThemingProvider.theme('default')
	//    .primaryPalette('cool-blue')
	//    .accentPalette('red')
	//    .warnPalette('deep-orange')
	//    .backgroundPalette('bg-white');

    $mdThemingProvider.theme('White-theme')
	.primaryPalette('blue-grey')
	.accentPalette('red')
    .warnPalette('orange')
    .backgroundPalette('blue-grey').dark();

    
   $mdThemingProvider.theme('light-blue')
    .primaryPalette('light-blue')
    .accentPalette('red');

   $mdThemingProvider.theme('amber')
    .primaryPalette('amber')
    .accentPalette('red');

   $mdThemingProvider.theme('cyan')
    .primaryPalette('cyan')
    .accentPalette('red');

   $mdThemingProvider.theme('dark-blue')
    .primaryPalette('yellow')
    .accentPalette('red');
//light-green
   $mdThemingProvider.theme('light-green')
    .primaryPalette('light-green')
    .accentPalette('red');
//lime
  $mdThemingProvider.theme('lime')
      .primaryPalette('lime')
      .accentPalette('pink');



         
   $mdThemingProvider.alwaysWatchTheme(true);
   ssSideNavSectionsProvider.initWithTheme($mdThemingProvider);
   $httpProvider.interceptors.push('httpInterceptor');
   
   $urlRouterProvider.otherwise("/");
   
   $stateProvider
   .state("landing", {url:"/", templateUrl : "/landing.html"})
   .state("account", {url:"/account", templateUrl : "/views/account/accountContainer.html", abstract:"true"})
   .state("account.login", {url:"/login", templateUrl : "/views/account/login.html"})
   .state("account.register", {url:"/register", templateUrl : "/views/account/register.html"})
   .state("account.forgotpassword", {url:"/forgotpassword", templateUrl : "/views/account/forgotpassword.html"})     
   
   //requires login
   .state("home", {url:"", templateUrl : "/views/homeContainer.html", abstract:true})
   .state("home.dashboard", {url:"/dashboard", templateUrl : "/views/dashboard.html"})
   .state("home.groups", {url:"/groups", templateUrl : "/views/groups/groups.html"})
   
   .state("home.group", {url:"/:g", templateUrl : "/views/groups/group.html"})
   .state("home.group.detail", {url:"/detail", templateUrl : "/views/groups/group.detail.html"})
   .state("home.group.analytics", {url:"/analytics", templateUrl : "./views/groups/group.analytics.html"})
   .state("home.group.assets", {url:"/assets?p", templateUrl : "./views/assets/asset.list.html"})
   .state("home.group.files", {url:"/files", templateUrl : "./views/assets/file.list.html"})
   .state("home.group.asset", {url:"/asset?p?type?a", templateUrl : "views/assets/asset.edit.html"})
   
   .state("home.asset", {url:"/:groupId/asset?p&type&a", templateUrl : "./views/groups/asset.edit.html"})
      
      
      
    ;
      
 }]);
 //Initialize state provider here.
 app.run(['$state', function ($state) {
   //hook the httpintercepter here so that it will add the token in each request
   //$httpProvider.interceptors.push('httpInterceptor');
       
 }]);
 

