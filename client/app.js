
/// <reference path="../typings/angularjs/angular.d.ts"/>
// Code goes here
 //module = angular.module('ezDirectives', ['ngFileUpload']);
 var app = angular.module('app', ['ngMaterial','ngMdIcons', 'ngAnimate', 'ngSanitize', 'ui.router',
      'ngStorage','ngFileUpload','ngImgCrop', 'ezDirectives','angular-cache','angularMoment',
      'cgBusy']);
 app.constant("config",{
     appTitle:"easy collaborate",
     apiBaseUrl : "",
     themes : ['default','light-blue','amber','cyan', 'light-green','lime']
  	
 })
 app.config([ "$httpProvider","$urlRouterProvider", '$stateProvider','$mdThemingProvider', 'CacheFactoryProvider', '$localStorageProvider',
 function($httpProvider, $urlRouterProvider, $stateProvider, $mdThemingProvider, CacheFactoryProvider, $localStorageProvider ){
   
   

   angular.extend(CacheFactoryProvider.defaults, { maxAge: 1 * 60 * 1000 });
   $localStorageProvider.setKeyPrefix("__cpadmin");
   
   $mdThemingProvider.theme('default')
    .primaryPalette('grey')
    .accentPalette('blue-grey');
    
    // $mdThemingProvider.theme('default')
    // .primaryPalette('purple')
    
   $mdThemingProvider.theme('light-blue')
    .primaryPalette('light-blue')
    .accentPalette('red');

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
   
   $httpProvider.interceptors.push('httpInterceptor');
   
   $urlRouterProvider.otherwise("/");
   
   $stateProvider
   .state("landing", {url:"/", templateUrl : "/landing.html"})
   .state("account", {url:"/account", templateUrl : "/views/account/accountContainer.html", abstract:"true"})
   .state("account.login", {url:"/login", templateUrl : "/views/account/login.html"})
   .state("account.forgotpassword", {url:"/forgotpassword", templateUrl : "/views/account/forgotpassword.html"})     
   
   //requires login
   .state("home", {url:"", templateUrl : "/views/homeContainer.html", abstract:true})
   .state("home.dashboard", {url:"/dashboard", templateUrl : "/views/dashboard.html"})
   .state("home.groups", {url:"/groups", templateUrl : "/views/groups/groups.html"})
   .state("home.group", {url:"/group/:id?", templateUrl : "/views/groups/group.html"})
   .state("home.groupDetail", {url:"/group/detail/:id?", templateUrl : "/views/groups/group.Detail.html"})
   
   .state("home.assets", {url:"/assets", templateUrl : "/views/assets.html"})
      
      
      
    ;
      
 }]);
 //Initialize state provider here.
 app.run(['$state', function ($state) {
   //hook the httpintercepter here so that it will add the token in each request
   //$httpProvider.interceptors.push('httpInterceptor');
       
 }]);
 

