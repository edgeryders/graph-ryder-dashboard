'use strict';

var conf = {
    apiUrl: 'http://localhost:5000/'
};

// Import variables if present (from env.js)
if(window){  
  Object.assign(conf, window.__config);
}

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
    'ngSanitize',
    'ngTable',
    'cfp.hotkeys'
  ])
  .constant('config', conf)
  .config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider', function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {

    $ocLazyLoadProvider.config({
      debug:false,
      events:true
    });

        
    $urlRouterProvider.otherwise('/dashboard/globalView');

    $stateProvider
    .state('dashboard', {
        url:'/dashboard',
        templateUrl: 'views/dashboard/main.html',
        controller: 'MainCtrl',
          resolve: {
              loadMyFiles: function ($ocLazyLoad, $q) {
              var prom1 = $ocLazyLoad.load({
                  name: 'sbAdminApp',
                  files: [
                      'scripts/services.js',
                      'scripts/directives/header/header.js',
                      'scripts/directives/settings/settings.js',
                      'scripts/directives/header/header-notification/header-notification.js',
                      'scripts/directives/sidebar/sidebar.js',
                      'scripts/directives/search/search_directive.js',
                      'scripts/directives/sigma/sigma.js',
                      'scripts/directives/timeLine/timeLine.js',
                      'scripts/directives/panelInfo/panelInfo.js'
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
                  name: 'chart.js',
                  files: [
                      'bower_components/angular-chart.js/dist/angular-chart.min.js',
                      'bower_components/angular-chart.js/dist/angular-chart.css'
                  ]
              });

              var promArray = [prom1, prom2, prom3, prom4, prom5, prom6, prom7];
              return $q.all(promArray)
          }
        }
    })
    .state('dashboard.globalView',{
        url:'/globalView',
        controller: 'GlobalCtrl',
        templateUrl:'views/dashboard/global-view.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/globalController.js',
                        'scripts/controllers/modalInstanceController.js'

                    ]
                })
            }
        }
    })
    .state('dashboard.multiView',{
        url:'/multiView',
        controller: 'MultiViewCtrl',
        templateUrl:'views/dashboard/multi-view.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/multiViewController.js',
                        'scripts/controllers/modalInstanceController.js'
                    ]
                })
            }
        }
    })
    .state('dashboard.tagView',{
        url:'/tagView',
        controller: 'TagViewCtrl',
        templateUrl:'views/dashboard/tag-view.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/tagViewController.js',
                        'scripts/controllers/modalInstanceController.js'
                    ]
                })
            }
        }
    })
    .state('dashboard.tagViewFull',{
        url:'/tagViewFull',
        controller: 'TagViewFullCtrl',
        templateUrl:'views/dashboard/tag-view-full.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/tagViewFullController.js',
                        'scripts/controllers/modalInstanceController.js'
                    ]
                })
            }
        }
    })
    .state('dashboard.tagCharacterViewFull',{
        url:'/tagCharacterViewFull',
        controller: 'TagCharacterViewFullCtrl',
        templateUrl:'views/dashboard/tag-character-view-full.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/tagCharacterViewFullController.js',
                        'scripts/controllers/modalInstanceController.js'
                    ]
                })
            }
        }
    })
    .state('dashboard.about',{
        url:'/about',
        controller: 'AboutCtrl',
        templateUrl:'views/dashboard/about.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/aboutController.js'
                    ]
                })
            }
        }
    })
    .state('dashboard.detanglerView',{
        url:'/detanglerView',
        controller: 'DetanglerViewCtrl',
        templateUrl:'views/dashboard/detangler-view.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/detanglerViewController.js',
                        'scripts/controllers/modalInstanceController.js',
                        'scripts/directives/search/search_directive.js'
                    ]
                })
            }
        }
    })
    .state('dashboard.elementsNotTagged',{
        url:'/elementsNotTagged',
        controller: 'ElementsNotTaggedCtrl',
        templateUrl:'views/dashboard/elements-not-tagged.html',
        resolve: {
            loadMyFiles:function($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name:'sbAdminApp',
                    files:[
                        'scripts/controllers/main.js',
                        'scripts/controllers/elementsNotTaggedController.js',
                        'scripts/controllers/modalInstanceController.js'
                    ]
                })
            }
        }
    });

  }]);
