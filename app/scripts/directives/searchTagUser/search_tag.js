'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('sbAdminApp')
  .directive('tagSearch', function($rootScope) {
    return {
      templateUrl:'scripts/directives/searchTagUser/tag_search.html',
      restrict: 'E',
      replace: true,
      scope: {
      },
      controller:function($scope){
        $scope.selectedMenu = 'home';
        $scope.suggestionsTag = [];

        $rootScope.$watch('suggestionsTag', function(newVal) {
          if(newVal != undefined)
            $scope.suggestionsTag = newVal;
          if($scope.suggestionsTag.length == 0)
              $scope.tag_search = null;
        });

        $scope.submit = function() {
          $rootScope.tag_search = $scope.search;
        }
      }
    }
  });
