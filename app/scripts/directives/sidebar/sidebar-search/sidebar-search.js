'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('sbAdminApp')
  .directive('sidebarSearch', function($rootScope) {
    return {
      templateUrl:'scripts/directives/sidebar/sidebar-search/sidebar-search.html',
      restrict: 'E',
      replace: true,
      scope: {
      },
      controller:function($scope){
        $scope.selectedMenu = 'home';
        $scope.suggestions = [];

        $rootScope.$watch('suggestions', function(newVal) {
          if(newVal != undefined)
            $scope.suggestions = newVal;
          if($scope.suggestions.length == 0)
              $scope.search = null;
        });

        $scope.submit = function() {
          $rootScope.search = $scope.search;
        }
      }
    }
  });
