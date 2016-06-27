'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('DoiCtrl', function ($scope, $resource, config, $rootScope, $uibModal) {

      $scope.type = "doi";
      $scope.graphSigma = [];
      $rootScope.suggestions = [];
      $scope.nodes = [];
      /***** Load all data *****/
      //get users
      var Users = $resource(config.apiUrl + 'users');
      var users = Users.query();
      users.$promise.then(function (result) {
          $scope.users = result;
          angular.forEach($scope.users, function(user) {
              $scope.nodes.push(user);
              if(user.name != undefined)
                  $rootScope.suggestions.push(user.name);
          });
      });
      //get posts
      var Posts = $resource(config.apiUrl + 'posts');
      var posts = Posts.query();
      posts.$promise.then(function (result) {
          $scope.posts = result;
          angular.forEach($scope.posts, function(post) {
              $scope.nodes.push(post);
              if(post.title != undefined)
                  $rootScope.suggestions.push(post.title);
          });
      });
      //get comments
      var Comments = $resource(config.apiUrl + 'comments');
      var comments = Comments.query();
      comments.$promise.then(function (result) {
          $scope.comments = result;
          angular.forEach($scope.comments, function(comment) {
              $scope.nodes.push(comment);
              if(comment.subject != undefined)
                  $rootScope.suggestions.push(comment.subject);
          });
      });
      // get layout algo
      var Layout = $resource(config.apiUrl + 'layoutAlgorithm');
      var layout = Layout.query();
      layout.$promise.then(function (result) {
          var layout = []
          var layoutName = ""
          angular.forEach(result, function(value) {
              layoutName = ""
              angular.forEach(value, function(value2) {
                  layoutName += value2;
              });
              layout.push(layoutName)
          });
          $scope.layout = layout;
      });

      /***** Graph creation *****/
      $scope.field = "uid";
      $scope.value = "34";
      $scope.layoutChoice = "FM^3 (OGDF)";
      $scope.submit = function () {
          // // Read the complete graph from api
          if($scope.field == "uid" && $scope.user)
              $scope.value = $scope.user;
          else if($scope.field == "pid" && $scope.post)
              $scope.value = $scope.post;
          else if($scope.field == "cid" && $scope.comment)
              $scope.value = $scope.comment;
          if($scope.type === "doi")
              var CreateGraph = $resource(config.apiUrl + 'doi/'+ $scope.field +'/'+ $scope.value);
          else
              var CreateGraph = $resource(config.apiUrl + 'createGraph/'+ $scope.field +'/'+ $scope.value);
          var creategraph = CreateGraph.query();
          creategraph.$promise.then(function (result) {
              var graph_id = result.pop();
              var graph_id_string = ""
              angular.forEach(graph_id, function(value) {
                  graph_id_string += value;
              });
              var drawGraph = $resource(config.apiUrl + 'draw/'+ graph_id_string +'/'+ $scope.layoutChoice);
              var drawgraph = drawGraph.query();
              drawgraph.$promise.then(function (result) {
                  $scope.graphSigma = result.pop();
              });
          });
      };

      $scope.submit();

      /*** Event catcher  ***/
      $scope.eventCatcher = function (e) {
          switch(e.type) {
              case 'clickNode':
                  if(e.data.node.uid != undefined) {
                      $scope.elementType = "uid";
                      $scope.elementId = e.data.node.uid;
                  }
                  else if(e.data.node.pid != undefined) {
                      $scope.elementType = "pid";
                      $scope.elementId = e.data.node.pid;
                  }
                  else if(e.data.node.cid != undefined) {
                      $scope.elementType = "cid";
                      $scope.elementId = e.data.node.cid;
                  }
                  $scope.openModal($scope.elementType, $scope.elementId);
                  break;
          }
      };
      /********* Modal  ***************/
      $scope.openModal = function (type, id) {
          $scope.elementType = type;
          $scope.elementId = id;

          var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: 'views/ui-elements/modal-view.html',
              controller: 'ModalInstanceCtrl',
              buttons: {
                  Cancel: function () {
                      $("#modal_dialog").dialog("close");
                  }
              },
              resolve: {
                  scopeParent: function() {
                      return $scope; //On passe à la fenêtre modal une référence vers le scope parent.
                  }
              }
          });

          // Catch return, reopen a new modal ?
          modalInstance.result.then(function (res) {
              if(res != undefined) {
                  res = res.split(':');
                  $scope.openModal(res[0], res[1]);
              }
          });
      };

      /*** search catcher *****/
      $rootScope.$watch('search', function(newVal) {
          angular.forEach($scope.nodes, function(node) {
              if( node.name == newVal || node.title == newVal || node.subject == newVal) {
                  if( node.uid != undefined) {
                      $scope.field = "uid";
                      $scope.value = node.uid;
                  }
                  else if( node.pid != undefined) {
                      $scope.field = "pid";
                      $scope.value = node.pid;
                  }
                  else if( node.cid != undefined) {
                      $scope.field = "cid";
                      $scope.value = node.cid;
                  }
              }
          });
          $scope.submit();
      });
});
