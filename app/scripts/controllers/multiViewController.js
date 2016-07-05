'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MultiViewCtrl
 * @description
 * # MultiViewCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('MultiViewCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $location, $timeout) {

        /**** Init ****/
        // wait rootScope to be ready
        $rootScope.$watch('ready', function(newVal) {
            if(newVal) {
                $scope.layoutChoice = $rootScope.layout[17];
                $scope.layoutChoiceComments = $rootScope.layout[17];
                $scope.userGraphRessource = $resource(config.apiUrl + 'draw/usersToUsers/' + $scope.layoutChoice);
                $scope.drawUserGraph(true);
                $scope.darwPostGraph();
            }
        });

        /*** user view ***/
        $scope.usersGraphSigma = [];

        $scope.drawUserGraph = function (suggestions) {
            $scope.drawGraphPromise = $scope.userGraphRessource.get();
            $scope.drawGraphPromise.$promise.then(function (result) {
                $scope.usersGraphSigma = result;
                $scope.nodes = $scope.usersGraphSigma.nodes;
                if(suggestions) {
                    $rootScope.suggestions = [];
                    angular.forEach($scope.nodes, function (node) {
                        if (node.name != undefined) {
                            node.label = node.name;
                            $rootScope.suggestions.push(node);
                        }
                    });
                }
            });
        };

        /*** post view ***/
        // todo generate this view from the other ( via edges values )
        $scope.commentsGraphSigma = [];
        $scope.darwPostGraph = function () {
            var url = config.apiUrl + 'draw/commentAndPost/'+ $scope.layoutChoiceComments;
            $resource(url).get().$promise.then(function (result) {
                $scope.commentsGraphSigma = result;
            });
        };

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
                case 'clickEdges':
                    if(e.data.edge != undefined && e.data.edge.length > 0) {
                        $scope.comments = [];
                        $scope.locate = [];
                        angular.forEach(e.data.edge, function(value) {
                            var comment = {from_id : "", from_subject: "", to_id: "", to_subject: ""};
                            if (value.pid != undefined) {
                                comment.from_id = value.cid;
                                $scope.locate.push(parseInt(value.cid));
                                comment.from_subject = value.comment_subject;
                                comment.to_type = "pid";
                                comment.to_id = value.pid;
                                $scope.locate.push(parseInt(value.pid));
                                comment.to_subject = value.post_title;
                            }
                            else {
                                comment.from_id = value.cid1;
                                $scope.locate.push(parseInt(value.cid1));
                                comment.from_subject = value.comment1_subject;
                                comment.to_type = "cid";
                                comment.to_id = value.cid2;
                                $scope.locate.push(parseInt(value.cid2));
                                comment.to_subject = value.comment2_subject;
                            }
                            $scope.comments.push(comment);
                        });
                        $scope.$apply();
                    }
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
                        return $scope; // Give to the modal the parent scope reference
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

        /*** search catcher *****/
        $rootScope.$watch('search', function(newVal) {
            if(newVal != undefined) {
                if( newVal.uid != undefined) {
                    var type = "uid";
                    var id = newVal.uid;
                }
                else if( newVal.pid != undefined) {
                    var type = "pid";
                    var id = newVal.pid;
                }
                else if( newVal.cid != undefined) {
                    var type = "cid";
                    var id = newVal.cid;
                }
                var params = {"max_size": 5};
                var CreateGraph = $resource(config.apiUrl + 'doi/usersToUsers/'+ type +'/'+ id, params);
                var creategraph = CreateGraph.get();
                creategraph.$promise.then(function (result) {
                    $scope.userGraphRessource = $resource(config.apiUrl + 'draw/'+ result.gid +'/'+ $scope.layoutChoice);
                    // todo do not wait but cancel the promise
                    if (!$scope.drawGraphPromise.$resolved)
                        $timeout(function() { $scope.drawUserGraph(); }, 1000);
                    else
                        $scope.drawUserGraph(false);
                });
            }
        });

        /***** On exit *****/
        $scope.$on("$destroy", function(){
            $rootScope.resetSuggestions(false, true, true);
            //todo stop all pending request
            // remove watchers in rootScope
            angular.forEach($rootScope.$$watchers, function(watcher, key) {
                if(watcher.exp === 'search' || watcher.exp === 'ready')
                    $rootScope.$$watchers.splice(key, 1);
            });
        });
    });
