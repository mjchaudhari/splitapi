
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
    $mdThemingProvider.definePalette('cool-blue', {
      '50': '#f4fcfd',
      '100': '#b2e8f2',
      '200': '#82d9ea',
      '300': '#45c7e0',
      '400': '#2bbfdc',
      '500': '#21acc7',
      '600': '#1d95ad',
      '700': '#187f93',
      '800': '#146878',
      '900': '#10515e',
      'A100': '#f4fcfd',
      'A200': '#b2e8f2',
      'A400': '#2bbfdc',
      'A700': '#187f93',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': '50 100 200 300 400 500 A100 A200 A400'
    });
    
    $mdThemingProvider.definePalette('light-gray', {
      '50': '#e7eeef',
      '100': '#baced0',
      '200': '#98b7b9',
      '300': '#6e999c',
      '400': '#5f898c',
      '500': '#53777a',
      '600': '#476568',
      '700': '#3a5356',
      '800': '#2e4243',
      '900': '#213031',
      'A100': '#e7eeef',
      'A200': '#baced0',
      'A400': '#5f898c',
      'A700': '#3a5356',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': '50 100 200 300 A100 A200'
    });
    $mdThemingProvider.definePalette('red1', {
        '50': '#fdf6f5',
        '100': '#f0bfb5',
        '200': '#e79687',
        '300': '#db624b',
        '400': '#d64b32',
        '500': '#c23f27',
        '600': '#a83722',
        '700': '#8f2e1d',
        '800': '#762618',
        '900': '#5c1e13',
        'A100': '#fdf6f5',
        'A200': '#f0bfb5',
        'A400': '#d64b32',
        'A700': '#8f2e1d',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': '50 100 200 300 A100 A200'
    });
    $mdThemingProvider.definePalette('cool-green', {
      '50': '#fcfefb',
      '100': '#d4ebc1',
      '200': '#b7de97',
      '300': '#91cd61',
      '400': '#81c549',
      '500': '#72b63a',
      '600': '#639f33',
      '700': '#55882b',
      '800': '#467024',
      '900': '#38591c',
      'A100': '#fcfefb',
      'A200': '#d4ebc1',
      'A400': '#81c549',
      'A700': '#55882b',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': '50 100 200 300 400 500 600 A100 A200 A400'
    });

    $mdThemingProvider.theme('default')
	   .primaryPalette('cool-blue')
	   .accentPalette('red')
	   .warnPalette('deep-orange')
	   .backgroundPalette('bg-white');
//--------------------------------White Theme----------------------------------------
    $mdThemingProvider.definePalette('bg-white', {
    '50': '#ffffff',
    '100': '#ffffff',
    '200': '#ffffff',
    '300': '#f0efef',
    '400': '#e1e0df',
    '500': '#d2d1cf',
    '600': '#c3c2bf',
    '700': '#b4b3af',
    '800': '#a6a4a0',
    '900': '#979490',
    'A100': '#ffffff',
    'A200': '#ffffff',
    'A400': '#e1e0df',
    'A700': '#b4b3af',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 400 500 600 700 800 900 A100 A200 A400 A700'
    });

    $mdThemingProvider.definePalette('primary-gray', {
      '50': '#ffffff',
      '100': '#ffffff',
      '200': '#ffffff',
      '300': '#e4e3e5',
      '400': '#d4d4d6',
      '500': '#c5c4c7',
      '600': '#b6b4b8',
      '700': '#a6a5a9',
      '800': '#97959a',
      '900': '#87858b',
      'A100': '#ffffff',
      'A200': '#ffffff',
      'A400': '#d4d4d6',
      'A700': '#a6a5a9',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': '50 100 200 300 400 500 600 700 800 900 A100 A200 A400 A700'
    });

    $mdThemingProvider.definePalette('accent-red', {
    '50': '#fdf5f7',
    '100': '#efb6c0',
    '200': '#e68897',
    '300': '#d94d64',
    '400': '#d4344e',
    '500': '#c02942',
    '600': '#a72439',
    '700': '#8e1e31',
    '800': '#741928',
    '900': '#5b131f',
    'A100': '#fdf5f7',
    'A200': '#efb6c0',
    'A400': '#d4344e',
    'A700': '#8e1e31',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 A100 A200'
    });

    $mdThemingProvider.definePalette('warn-orange', {
    '50': '#ffffff',
    '100': '#fae0c7',
    '200': '#f5c493',
    '300': '#efa152',
    '400': '#ed9136',
    '500': '#ea821a',
    '600': '#d27313',
    '700': '#b66311',
    '800': '#9a540e',
    '900': '#7e450c',
    'A100': '#ffffff',
    'A200': '#fae0c7',
    'A400': '#ed9136',
    'A700': '#b66311',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 400 500 600 A100 A200 A400'
    });

    $mdThemingProvider.definePalette('success-green', {
    '50': '#ecf4ec',
    '100': '#bad9ba',
    '200': '#96c696',
    '300': '#68ac68',
    '400': '#579f57',
    '500': '#4c8b4c',
    '600': '#417741',
    '700': '#366336',
    '800': '#2c502c',
    '900': '#213c21',
    'A100': '#ecf4ec',
    'A200': '#bad9ba',
    'A400': '#579f57',
    'A700': '#366336',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': '50 100 200 300 400 A100 A200 A400'
    });

    $mdThemingProvider.theme('White-theme')
	.primaryPalette('primary-gray')
	.accentPalette('accent-red')
    .warnPalette('warn-orange')
    .backgroundPalette('bg-white').dark();

    
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
   .state("account.forgotpassword", {url:"/forgotpassword", templateUrl : "/views/account/forgotpassword.html"})     
   
   //requires login
   .state("home", {url:"", templateUrl : "/views/homeContainer.html", abstract:true})
   .state("home.dashboard", {url:"/dashboard", templateUrl : "/views/dashboard.html"})
   .state("home.groups", {url:"/groups", templateUrl : "/views/groups/groups.html"})
   
   .state("home.group", {url:"/group/:id", templateUrl : "/views/groups/group.html"})
   .state("home.group.detail", {url:"/detail", templateUrl : "/views/groups/group.detail.html"})
   .state("home.group.analytics", {url:"/analytics", templateUrl : "./views/groups/group.analytics.html"})
   .state("home.group.assets", {url:"/assets", templateUrl : "./views/groups/assetlist.html"})
   .state("home.group.asset", {url:"/asset/:id?", templateUrl : "./views/groups/asset.edit.html"})
   
   .state("home.assets", {url:"/assets", templateUrl : "/views/assets.html"})
      
      
      
    ;
      
 }]);
 //Initialize state provider here.
 app.run(['$state', function ($state) {
   //hook the httpintercepter here so that it will add the token in each request
   //$httpProvider.interceptors.push('httpInterceptor');
       
 }]);
 

