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
        controller: ['$scope', '$rootScope', 'resizeBroadcast', function HeaderController($scope, $rootScope, resizeBroadcast) {

          $scope.toggleMobileSidebar = function() {
            $('body').toggleClass('sidebar-mobile-show');
            resizeBroadcast();
          };

          $scope.toggleAside = function() {
            $('body').toggleClass('aside-menu-hidden');
            $rootScope.$broadcast('aside-menu:show');
            resizeBroadcast();
          };

        }],      
    	}
	});


