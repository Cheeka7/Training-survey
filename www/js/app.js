  // Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'chart.js', 'firebase', 'user.controllers', 'user.services', 'admin.controllers', 'admin.services', 'ngSanitize', 'ngCordova'])


.run(function ($ionicPlatform, $rootScope, $state,$timeout) {
   $ionicPlatform.registerBackButtonAction(function (event) {
            if($state.current.name=="login"){
              navigator.app.exitApp();
            }

   }, 100);

})




.config(function($stateProvider, $urlRouterProvider, $compileProvider) {

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    cache: false,
    controller: 'loginCtrl'
  })

    .state('changePassword', {
    url: '/changePassword',
    templateUrl: 'templates/changePassword.html',
    cache: false,
    controller: 'changePasswordCtrl'
  })

    .state('forgotPassword', {
    url: '/forgotPassword',
    templateUrl: 'templates/forgotPassword.html',
    cache: false,
    controller: 'forgotPasswordCtrl'
    })


  .state('welcome', {
        url: '/welcome',
        templateUrl: 'templates/user/welcome.html',
        cache: false,
        controller: 'welcomeCtrl'
      })

  .state('radio', {
        url: '/radio/:counter',
        templateUrl: 'templates/user/radio.html',
        cache: false,
        controller: 'questionCtrl'

  })

  .state('range', {
        url: '/range/:counter',
        templateUrl: 'templates/user/range.html',
        controller: 'questionCtrl'

  })

  .state('checkbox', {
        url: '/checkbox/:counter',
        templateUrl: 'templates/user/checkbox.html',
        cache: false,
        controller: 'questionCtrl'

  })

  .state('text', {
        url: '/text/:counter',
        templateUrl: 'templates/user/text-input.html',
        cache: false,
        controller: 'questionCtrl'

  })

  .state('thankyou', {
        url: '/thankyou/:noOfQuestions/:noOfCorrectAnswers',
        templateUrl: 'templates/user/thankyou.html',
        cache: false,
        controller: 'thankyouCtrl'
  })

  .state('chart', {
        url: '/chart/:noOfQuestions/:noOfCorrectAnswers',
        templateUrl: 'templates/user/result-chart.html',
        cache: false,
        controller: 'chartCtrl'
  })

  .state('admin-summary', {
        url: '/adminSummary',
        templateUrl: 'templates/admin/admin-summary.html',
        cache: false,
        controller: 'adminSummaryCtrl'
  })

  .state('admin-freeForm', {
        url: '/freeForm/:key',
        templateUrl: 'templates/admin/admin-freeForm.html',
        cache: false,
        controller: 'freeFormCtrl'
  })

  .state('admin-chart', {
        url: '/adminChart',
        templateUrl: 'templates/admin/admin-chart.html',
        cache: false,
        controller: 'adminChartCtrl'
  })

  .state('intro', {
        url: '/intro/:flag',
        templateUrl: 'templates/user/intro.html',
        cache: false,
        controller: 'introCtrl'
  })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
