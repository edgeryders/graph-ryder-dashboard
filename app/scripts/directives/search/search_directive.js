'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('sbAdminApp')
  .directive('generalSearch', function($rootScope) {
    return {
      templateUrl: function(elem, attr) {
      return attr.templateUrl;
      },
      restrict: 'E',
      replace: true,
      scope: {
        sugest : '@'
      },
      controller:function($scope){
        $scope.selectedMenu = 'home'; // A quoi cela sert ?
        $scope.suggestions = [];


        $rootScope.$watch($scope.sugest, function(newVal) {
          if(newVal != undefined)
            $scope.suggestions = newVal;
          if($scope.suggestions.length == 0)
              $scope.search = null;
        });

        if ($scope.sugest === "suggestionsUser"){
          $scope.submit = function() {
            $rootScope.user_search = $scope.search;
            console.log($rootScope.user_search);
          }
        }
        else if ($scope.sugest === "suggestionsTag") {
          $scope.submit = function() {
            $rootScope.tag_search = $scope.search;
            console.log($rootScope.tag_search);
          }
        }
        else if ($scope.sugest === "suggestions") {
          $scope.submit = function() {
            $rootScope.search = $scope.search;
            console.log($rootScope.search);
          }
        }
        else{
          console.log("Variable sugest is not handle")
        }
      }
    }
  });
