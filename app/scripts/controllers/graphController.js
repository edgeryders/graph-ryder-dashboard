'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('GraphCtrl', function ($scope, $resource) {

      $scope.type = "doi";
      $scope.apiUrl = "http://nferon.ovh:5000/";
      $scope.graphSigma = [];
      //get users
      var Users = $resource($scope.apiUrl + 'users');
      var users = Users.query();
      users.$promise.then(function (result) {
          $scope.users = result;
      });
      //get posts
      var Posts = $resource($scope.apiUrl + 'posts');
      var posts = Posts.query();
      posts.$promise.then(function (result) {
          $scope.posts = result;
      });
      //get comments
      var Comments = $resource($scope.apiUrl + 'comments');
      var comments = Comments.query();
      comments.$promise.then(function (result) {
          $scope.comments = result;
      });
      // get layout algo
      var Layout = $resource($scope.apiUrl + 'layoutAlgorithm');
      var layout = Layout.query();
      layout.$promise.then(function (result) {
          var layout = []
          var layoutName = ""
          angular.forEach(result, function(value, key) {
              layoutName = ""
              angular.forEach(value, function(value2, key) {
                  layoutName += value2;
              });
              layout.push(layoutName)
          });
          $scope.layout = layout;
      });

      $scope.field = "uid";
      $scope.value = "34";
      $scope.layoutChoice = "FM^3 (OGDF)";
      $scope.submit = function () {
          // // Read the complete graph from api
          if($scope.type === "complete") {
              var drawGraph = $resource($scope.apiUrl + 'draw/complete/' + $scope.layoutChoice);
              var drawgraph = drawGraph.query();
              drawgraph.$promise.then(function (result) {
                  $scope.graphSigma = result.pop();
                  console.log("done");
              });
          }
          else {
              if($scope.field == "uid" && $scope.user)
                  $scope.value = $scope.user;
              else if($scope.field == "pid")
                  $scope.value = $scope.post;
              else if($scope.field == "cid")
                  $scope.value = $scope.comment;
              if($scope.type === "doi")
                  var CreateGraph = $resource($scope.apiUrl + 'doi/'+ $scope.field +'/'+ $scope.value);
              else
                  var CreateGraph = $resource($scope.apiUrl + 'createGraph/'+ $scope.field +'/'+ $scope.value);
              var creategraph = CreateGraph.query();
              creategraph.$promise.then(function (result) {
                  var graph_id = result.pop();
                  var graph_id_string = ""
                  angular.forEach(graph_id, function(value, key) {
                      graph_id_string += value;
                  });
                  console.log(graph_id_string);
                  var drawGraph = $resource($scope.apiUrl + 'draw/'+ graph_id_string +'/'+ $scope.layoutChoice);
                  var drawgraph = drawGraph.query();
                  drawgraph.$promise.then(function (result) {
                      $scope.graphSigma = result.pop();
                      console.log("done");
                  });
              });
          }
      };

      $scope.submit();
});