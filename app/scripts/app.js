'use strict';
/**
 * @ngdoc overview
 * @name sbAdminApp
 * @description
 * # sbAdminApp
 *
 * Main module of the application.
 */
angular
  .module('sbAdminApp', [
    'oc.lazyLoad',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'ngResource'
  ])
  .constant('config', {
        apiUrl: 'http://192.168.99.100:5000/',
    })
  .config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {
    
    $ocLazyLoadProvider.config({
      debug:false,
      events:true,
    });

    $urlRouterProvider.otherwise('/dashboard/globalView');

    $stateProvider
    .state('dashboard', {
        url:'/dashboard',
        templateUrl: 'views/dashboard/main.html',
          resolve: {
              loadMyFiles: function ($ocLazyLoad, $q) {
              var prom1 = $ocLazyLoad.load({
                  name: 'sbAdminApp',
                  files: [
                      'scripts/directives/header/header.js',
                      'scripts/directives/header/header-notification/header-notification.js',
                      'scripts/directives/sidebar/sidebar.js',
                      'scripts/directives/sidebar/sidebar-search/sidebar-search.js',
                      'scripts/directives/sigma/sigma.js',
                      'scripts/directives/notifications/modal-view.js'
                  ]
              });
              var prom2 = $ocLazyLoad.load({
                  name: 'toggle-switch',
                  files: ["bower_components/angular-toggle-switch/angular-toggle-switch.min.js",
                      "bower_components/angular-toggle-switch/angular-toggle-switch.css"
                  ]
              });
              var prom3 = $ocLazyLoad.load({
                  name: 'ngAnimate',
                  files: ['bower_components/angular-animate/angular-animate.js']
              });
              var prom4 = $ocLazyLoad.load({
                  name: 'ngCookies',
                  files: ['bower_components/angular-cookies/angular-cookies.js']
              });
              var prom5 = $ocLazyLoad.load({
                  name: 'ngResource',
                  files: ['bower_components/angular-resource/angular-resource.js']
              });
              var prom6 = $ocLazyLoad.load({
                  name: 'ngSanitize',
                  files: ['bower_components/angular-sanitize/angular-sanitize.js']
              });
              var prom7 = $ocLazyLoad.load({
                  name: 'ngTouch',
                  files: ['bower_components/angular-touch/angular-touch.js']
              });
              var prom8 = $ocLazyLoad.load({
                  name: 'chart.js',
                  files: [
                      'bower_components/angular-chart.js/dist/angular-chart.min.js',
                      'bower_components/angular-chart.js/dist/angular-chart.css'
                  ]
              });

              var promArray = [prom1, prom2, prom3, prom4, prom5, prom6, prom7, prom8];
              return $q.all(promArray);
          }
        }
    })
    .state('dashboard.doi',{
        url:'/doi',
        controller: 'MainCtrl',
        templateUrl:'views/dashboard/doi.html',
        resolve: {
          loadMyFiles:function($ocLazyLoad) {
            return $ocLazyLoad.load({
              name:'sbAdminApp',
              files:[
              'scripts/controllers/main.js',
              'scripts/controllers/doiController.js'
              ]
            })
          }
        }
    })
    .state('dashboard.globalView',{
        url:'/globalView',
        controller: 'MainCtrl',
        templateUrl:'views/dashboard/global-view.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/globalController.js'
                    ]
                })
            }
        }
    })
    .state('dashboard.multiView',{
        url:'/multiView',
        controller: 'MainCtrl',
        templateUrl:'views/dashboard/multi-view.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/multiViewController.js'
                    ]
                })
            }
        }
    })
  }]);

    
