// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'Today.controller', 'Calendar.controller', 'starter.services', 'ngMaterial', 'ngIdle', 'ui.calendar', 'angularMoment'])

.run(function($ionicPlatform, $http, Idle, $rootScope, $state, $ionicPopup, ENV) {
    sessionStorage.clear()
    Idle.watch();
    $rootScope.$on('IdleTimeout', function(){
        $http.get(ENV.apiUrl+"/auth/logout");
        sessionStorage.removeItem('token')
        sessionStorage.clear();
        $state.go('login')
        $rootScope.logOutMessage = "You've been logged out due to 15 minutes of inactivity"
    })
  $ionicPlatform.ready(function() {
    if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $ionicPopup.confirm({
                        title: "Internet Disconnected",
                        content: "The internet is disconnected on your device."
                    })
                    .then(function(result) {
                        if(!result) {
                            ionic.Platform.exitApp();
                        }
                    });
                }
            }
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, KeepaliveProvider, IdleProvider) {
  IdleProvider.idle(900);
  IdleProvider.timeout(0.0000003);
  KeepaliveProvider.interval(1);
  $ionicConfigProvider.views.maxCache(0);

  $ionicConfigProvider.tabs.position('bottom'); 

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html', 
      controller: 'LoginCtrl'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
    .state('tab.today', {
    url: '/today',
    views: {
      'tab-today': {
        templateUrl: 'templates/tab-today.html',
        controller: 'TodayCtrl'
      }
    }
  })
    .state('tab.calendar', {
    url: '/calendar',
    views: {
      'tab-calendar': {
        templateUrl: 'templates/tab-calendar.html',
        controller: 'CalendarCtrl'
      }
    }
  }); 

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
