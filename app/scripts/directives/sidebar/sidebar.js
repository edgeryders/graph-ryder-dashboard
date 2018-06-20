'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('sbAdminApp')
  .directive('sidebar',['$location',function() {
    return {
      templateUrl:'scripts/directives/sidebar/sidebar.html',
      restrict: 'E',
      replace: true,
      scope: {
      },
      controller: ['$scope', 'resizeBroadcast', 'hotkeys', function SidebarController($scope, resizeBroadcast, hotkeys) {

        $scope.selectedMenu = 'dashboard';
        $scope.collapseVar = 0;
        $scope.multiCollapseVar = 0;
    
        $scope.check = function(x){
      
          if(x==$scope.collapseVar)
            $scope.collapseVar = 0;
          else
            $scope.collapseVar = x;
        };
    
        $scope.multiCheck = function(y){
      
          if(y==$scope.multiCollapseVar)
            $scope.multiCollapseVar = 0;
          else
            $scope.multiCollapseVar = y;
        };

        $scope.brandMinimize = function() {
          $('body').toggleClass('brand-minimized');
          $('body').toggleClass('sidebar-minimized');
          resizeBroadcast();
        };

        /***** Setup navigation hotkeys *******/
        var navigateTo = function(what){
          console.log(what);
          $('#dashboard-'+what).click();
        }
        hotkeys.add({
          combo: 'ctrl+1',
          description: 'Open Conversation',
          callback: function() { navigateTo('globalView'); }
        });
        // hotkeys.add({
        //   combo: 'ctrl+6',
        //   description: 'Open Degree of Interest',
        //   callback: function() { navigateTo('doi'); }
        // });
        hotkeys.add({
          combo: 'ctrl+2',
          description: 'Open Code View',
          callback: function() { navigateTo('tagView'); }
        });
        hotkeys.add({
          combo: 'ctrl+3',
          description: 'Open Code View Full',
          callback: function() { navigateTo('tagViewFull'); }
        });
        hotkeys.add({
          combo: 'ctrl+4',
          description: 'Open Detangler View',
          callback: function() { navigateTo('detanglerView'); }
        });
        hotkeys.add({
          combo: 'ctrl+5',
          description: 'Open Elements not Tagged',
          callback: function() { navigateTo('elementsNotTagged'); }
        });
        hotkeys.add({
          combo: 'ctrl+9',
          description: 'Toggle Sidebar',
          callback: function() { $scope.brandMinimize(); }
        });


      }]    
    }
  }]);

