'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('sbAdminApp')
	.directive('header',function(){
		return {
        templateUrl:'scripts/directives/header/header.html',
        restrict: 'E',
        replace: true,
        scope: {
        },
        controller: ['$scope', '$rootScope', 'resizeBroadcast', 'hotkeys', function HeaderController($scope, $rootScope, resizeBroadcast, hotkeys) {

          $scope.toggleMobileSidebar = function() {
            $('body').toggleClass('sidebar-mobile-show');
            resizeBroadcast();
          };

          $scope.toggleAside = function() {
            $('body').toggleClass('aside-menu-hidden');
            $rootScope.$broadcast('aside-menu:show');
            resizeBroadcast();
          };

          hotkeys.add({
            combo: 'ctrl+0',
            description: 'Open Settings',
            callback: function() { $scope.toggleAside(); }
          });
          hotkeys.add({
            combo: 'ctrl+s',
            description: 'Focus on Search Field',
            callback: function() { angular.element('#header-search-field').focus() }
          });

        }],      
    	}
	});


