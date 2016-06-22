'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MultiViewCtrl
 * @description
 * # MultiViewCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('MultiViewCtrl', function ($scope, $resource, config) {

        /**** Layout ****/
        $scope.layoutChoice = "GEM%20(Frick)";
        $scope.layoutChoiceComments = "GEM%20(Frick)";
        // get layout algo
        var Layout = $resource(config.apiUrl + 'layoutAlgorithm');
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

        /*** user view ***/
        $scope.usersGraphSigma = [];
        $scope.submit = function () {
            var drawGraph = $resource(config.apiUrl + 'draw/usersToUsers/'+ $scope.layoutChoice);
            var drawgraph = drawGraph.query();
            drawgraph.$promise.then(function (result) {
                $scope.usersGraphSigma = result.pop();
            });
        };

        $scope.submit();
        /*** post view ***/
        $scope.commentsGraphSigma = [];
        $scope.submit = function () {
            var params = {'type': 'user'};
            var CreateGraph = $resource(config.apiUrl + 'createGraphWithout', params);
            var creategraph = CreateGraph.query();
            creategraph.$promise.then(function (result) {
                var graph_id = result.pop();
                var graph_id_string = ""
                angular.forEach(graph_id, function(value, key) {
                    graph_id_string += value;
                });
                console.log(graph_id_string);
                var drawGraph = $resource(config.apiUrl + 'draw/'+ graph_id_string +'/'+ $scope.layoutChoiceComments);
                var drawgraph = drawGraph.query();
                drawgraph.$promise.then(function (result) {
                    $scope.commentsGraphSigma = result.pop();
                });
            });

        };

        $scope.submit();
        /*** Event Catcher Users ***/
        $scope.comments = [];
        $scope.click = false;
        $scope.locate = "Bondour ";

        $scope.eventCatcherUsers = function (e) {
            switch(e.type) {
                case 'clickNode':
                    console.log(e);
                    break;
                case 'hovers':
                    if($scope.click)
                        break;
                    else
                        e.data.edge = e.data.current.edges;
                case 'clickEdges':
                    $scope.click = (e.type != "hovers");
                    if(e.data.edge != undefined && e.data.edge.length > 0) {
                        $scope.comments = [];
                        $scope.locate = [];
                        angular.forEach(e.data.edge, function(value, key) {
                            var comment = {from_id : "", from_subject: "", to_id: "", to_subject: ""};
                            if (value.pid != undefined) {
                                comment.from_id = value.cid;
                                $scope.locate.push(value.cid);
                                comment.from_subject = value.comment_subject;
                                comment.to_type = "pid";
                                comment.to_id = value.pid;
                                $scope.locate.push(value.pid);
                                comment.to_subject = value.post_title;
                            }
                            else {
                                comment.from_id = value.cid1;
                                $scope.locate.push(value.cid1);
                                comment.from_subject = value.comment1_subject;
                                comment.to_type = "cid";
                                comment.to_id = value.cid2;
                                $scope.locate.push(value.cid2);
                                comment.to_subject = value.comment2_subject;
                            }
                            $scope.comments.push(comment)
                        });
                        $scope.$apply()
                    }
                    break;
            }
        };
        /*** Event catcher comment ***/
        $scope.eventCatcherComment = function (e) {
            switch(e.type) {
                case 'clickNode':
                    console.log(e);
                    break;
            }
        };
    });
