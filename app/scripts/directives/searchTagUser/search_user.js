'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('sbAdminApp')
  .directive('userSearch', function($rootScope) {
    return {
      templateUrl:'scripts/directives/searchTagUser/user_search.html',
      restrict: 'E',
      replace: true,
      scope: {
      },
      controller:function($scope){
        $scope.selectedMenu = 'home';
        $scope.suggestionsUser = [];

        $rootScope.$watch('suggestionsUser', function(newVal) {
          if(newVal != undefined)
            $scope.suggestionsUser = newVal;
          if($scope.suggestionsUser.length == 0)
              $scope.user_search = null;
        });

        $scope.submit = function() {
          $rootScope.user_search = $scope.search;
        }
      }
    }
  });
