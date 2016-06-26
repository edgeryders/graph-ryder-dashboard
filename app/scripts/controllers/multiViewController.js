'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MultiViewCtrl
 * @description
 * # MultiViewCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('MultiViewCtrl', function ($scope, $resource, config, $uibModal) {

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
        $scope.submitUser = function () {
            var drawGraph = $resource(config.apiUrl + 'draw/usersToUsers/'+ $scope.layoutChoice);
            var drawgraph = drawGraph.query();
            drawgraph.$promise.then(function (result) {
                $scope.usersGraphSigma = result.pop();
            });
        };

        $scope.submitUser();
        /*** post view ***/
        $scope.commentsGraphSigma = [];
        $scope.submitPost = function () {
        var drawGraph = $resource(config.apiUrl + 'draw/commentAndPost/'+ $scope.layoutChoiceComments);
        var drawgraph = drawGraph.query();
        drawgraph.$promise.then(function (result) {
            $scope.commentsGraphSigma = result.pop();
        });
        };

        $scope.submitPost();
        /*** Event Catcher Users ***/
        $scope.comments = [];
        $scope.click = false;
        $scope.locate = [];

        $scope.eventCatcherUsers = function (e) {
            switch(e.type) {
                case 'clickNode':
                    $scope.elementType = "uid";
                    $scope.elementId = e.data.node.uid;
                    $scope.openModal($scope.elementType, $scope.elementId);
                    break;
                case 'hovers':
                    if($scope.click)
                        break;
                    else
                        e.data.edge = e.data.current.edges;
                case 'clickEdges':
                    console.log(e);
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
        /********* Modal test ***************/


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

        /*** Event catcher comment ***/
        $scope.eventCatcherComment = function (e) {
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
    });
