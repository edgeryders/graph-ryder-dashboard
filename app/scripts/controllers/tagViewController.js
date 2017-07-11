/**
 * Created by nferon on 17/06/16.
 */
'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:GlobalCtrl
 * @description
 * # GlobalCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('TagViewCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $q, $location, $timeout, $compile) {

        /**** Init ****/
        //edge label default
        $scope.tagel = false;
        $scope.tagnl = false;
        $scope.nodelabelthreshold = 10;
        $scope.locate = "";
        $scope.filter_occurence_min = "1";
        $scope.filter_occurence_max = "100";
        $scope.tag_id = 1879;
        $scope.tag_src = {id: $scope.tag_id, label:""};
        $scope.tag_dst = {id: -1, label:""};
        $scope.requestFullTagGraph = false;
        $scope.showTagCommonContent = false;
        $scope.tableSizeChoice = '10';
        $scope.interactor = "navigate";
        $scope.infoPanelParent = "infoPanelParent";
        $("#download_link_dialog").dialog({ autoOpen: false });
        // When rootScope is ready load the graph
        $rootScope.$watch('ready', function(newVal) {
            if(newVal) {
                $scope.layoutChoice = $rootScope.layout[12];
                $scope.tableSizeChoice = 10;
                $scope.selected.start= new Date(0);
                $scope.selected.end= new Date(Date.now());
                //load tags then create the graph
                var Tags = $resource(config.apiUrl + "tags/"+$scope.selected.start.getTime()+"/"+$scope.selected.end.getTime()+"/"+$scope.tableSizeChoice).query().$promise;
                Tags.then(function (result) {
                    $scope.tags = result;
                    if($scope.tags[0])
                        $scope.generateGraph($scope.tags[0].id);
                });
            }
        });
        $( "#node-label-intensity-slider" ).slider({
            min: 0,
            max: $scope.nodelabelthreshold-1,
            value: 10-$scope.nodelabelthreshold,
            slide: function( event, ui ) {
                $scope.nodelabelthreshold = 10-ui.value;
                $scope.$apply();
            }
        });

        $( "#coocurrence-intensity-slider-range" ).slider({
            range: true,
            min: 1,
            max: $scope.filter_occurence_max,
            values: [ $scope.filter_occurence_min, $scope.filter_occurence_max ],
            slide: function( event, ui ) {
                $scope.filter_occurence_min = ui.values[0];
                $scope.filter_occurence_max = ui.values[1];
                $scope.$apply();
            }
        });

        $scope.switchForceNodeLabel = function() {
            if ($scope.tagnl) {
                $scope.nodelabelthreshold = 0;
            } else {
                $scope.nodelabelthreshold = 10;
            }
        };

        /***** Global view *****/
        $scope.tagGraphSigma = [];

        $scope.drawGraph = function () {
            var drawGraph = $resource(config.apiUrl + 'draw/tagToTags/'+ $scope.layoutChoice);
            var drawgraph = drawGraph.get();
            drawgraph.$promise.then(function (result) {
                $scope.tagGraphSigma = result;
            });
        };

        $scope.generateGraph = function (tag_id) {
            $scope.tag_id = tag_id;
            if ($scope.requestFullTagGraph) {
                var createGraph = $resource(config.apiUrl + 'generateTagFocusGraph/' + $scope.tag_id + "/" + $scope.selected.start.getTime() + "/" + $scope.selected.end.getTime());
            } else {
                var createGraph = $resource(config.apiUrl + 'generateTagDateGraph/' + $scope.tag_id + "/" + $scope.selected.start.getTime() + "/" + $scope.selected.end.getTime());
            }
            //var createGraph = $resource(config.apiUrl + 'generateTagGraph/' + $scope.tag_id);
            var createGraphPromise = createGraph.get();
            createGraphPromise.$promise.then(function (result) {
                $scope.drawGraph();
            });
        };

        $scope.switchTagGraph = function() {
            $scope.generateGraph($scope.tag_id);
        };



        $scope.generateDownloadLink = function () {
            $("#download_link_dialog").html($rootScope.generateDownloadLinkForSigma( $scope.tagGraphSigma.nodes, $scope.tagGraphSigma.edges, 'tag_view'));
            $("#download_link_dialog").attr('title', 'Download a copy of the graph');
            $("#download_link_dialog").dialog("open");
        }

        /*** TimeLine ****/
        $scope.time_data = [];
        $scope.selected = {};
        var timeLinePromises = [];

        // Create promises array to wait all data until load
        timeLinePromises.push($resource(config.apiUrl + 'posts/count/timestamp').query().$promise);
        timeLinePromises.push($resource(config.apiUrl + 'comments/count/timestamp').query().$promise);

        $q.all(timeLinePromises).then(function(results) {
            var tmp = {"users": [], "posts": [], "comments": []};
            // Posts
            angular.forEach(results[0], function(result) {
                tmp.posts.push(result);
            });
            // Comments
            angular.forEach(results[1], function (result) {
                tmp.comments.push(result);
            });
            // append data
            $scope.time_data = tmp;
        }, function (reject) {
            console.log(reject);
        });

        $scope.resetTimeLine = function () {
            $scope.selected.start= new Date(0);
            $scope.selected.end= new Date(Date.now());
            $scope.extent($scope.extent.start,  $scope.extent.end);
        }

        // Time selection have been made on the chart
        $scope.extent = function (start, end) {
            if(!start && !end) { //release signal
                var Tags = $resource(config.apiUrl + "tags/"+$scope.selected.start.getTime()+"/"+$scope.selected.end.getTime()+"/"+$scope.tableSizeChoice).query().$promise;
                Tags.then(function (result) {
                    $scope.tags = result;
                    if($scope.tags[0])
                        $scope.generateGraph($scope.tag_id);
                });
                $scope.$apply();
            } else {
                $scope.selected.start = start;
                $scope.selected.end = end;
                // Update sigma filter
                $scope.filter = {"start": start.getTime(), "end": end.getTime()};
                $scope.$apply();
            }
        };

        $scope.getTagTable = function (start, end, limit) {
            var Tags = $resource(config.apiUrl + "tags/"+start+"/"+end+"/"+limit).query().$promise;
            Tags.then(function (result) {
                return result;
            });
        };

        $scope.updateTagTable = function () {
            //$scope.tags = $scope.getTagTable($scope.selected.start.getTime(), $scope.selected.end.getTime(), $scope.tableSizeChoice);
            var Tags = $resource(config.apiUrl + "tags/"+$scope.selected.start.getTime()+"/"+ $scope.selected.end.getTime()+"/"+$scope.tableSizeChoice).query().$promise;
            Tags.then(function (result) {
                $scope.tags = result;
            });
            //$scope.$apply();
        };

        /*** Sigma Event Catcher ***/
        $scope.eventCatcher = function (e) {
            switch(e.type) {
                case 'clickNode':
                    if(e.data.node.tag_id != undefined && (e.data.captor.shiftKey || $scope.interactor == "focus")) {
                        $scope.generateGraph(e.data.node.tag_id);
                    }
                    if(e.data.node.tag_id != undefined && (e.data.captor.ctrlKey || $scope.interactor == "information")) {
                        if(e.data.node.user_id != undefined) {
                            $scope.elementType = "user";
                            $scope.elementId = e.data.node.user_id
                        }
                        else if (e.data.node.post_id != undefined) {
                            $scope.elementType = "post";
                            $scope.elementId = e.data.node.post_id;
                        }
                        else if (e.data.node.comment_id != undefined) {
                            $scope.elementType = "comment";
                            $scope.elementId = e.data.node.comment_id;
                        }
                        else if (e.data.node.tag_id != undefined) {
                            $scope.elementType = "tag";
                            $scope.elementId = e.data.node.tag_id;
                        }
                        else if (e.data.node.annotation_id != undefined) {
                            $scope.elementType = "annotation";
                            $scope.elementId = e.data.node.annotation_id;
                        }
                        else {
                            console.log("Unexpected node: "+e.data.node);
                        }
                        $scope.openInfoPanel($scope.elementType, $scope.elementId);
                    }
                    break;
                case 'clickEdges':
                    if(e.data.edge != undefined && e.data.edge.length > 0 && ((e.data.captor.ctrlKey || $scope.interactor == "information") || (e.data.captor.shiftKey || $scope.interactor == "focus"))) {
                        $scope.content = [];
                        $scope.showTagCommonContent = true;
                        var tagPromises = [];
                        // Create promises array to wait all data until load
                        tagPromises.push($resource(config.apiUrl + "tags/common/content/"+e.data.edge[0].tag_1+"/"+e.data.edge[0].tag_2+"/"+ $scope.selected.start.getTime()+"/"+ $scope.selected.end.getTime()).query().$promise);
                        tagPromises.push($resource(config.apiUrl + 'tag/'+e.data.edge[0].tag_1).get().$promise);
                        tagPromises.push($resource(config.apiUrl + 'tag/'+e.data.edge[0].tag_2).get().$promise);
                        tagPromises[0].then(function(result) {
                            //console.log(result);
                            $scope.content = result;
                        });
                        tagPromises[1].then(function(result) {
                            //console.log(result);
                            $scope.tag_src.id = result.tag_id;
                            $scope.tag_src.label = result.label;
                          //  $scope.tag_src = result;
                        });
                        tagPromises[2].then(function(result) {
                            $scope.tag_dst.id = result.tag_id;
                            $scope.tag_dst.label = result.label;
                        });
                        e.data.edge[0].color = 'rgb(0,0,0)';
                        //TODO tweek sigma renderer for immediate response
                        //var s = e.data.renderer;
                        //s.refresh();
                    }
                    break;
            }
        };

        /********* Info Panel ***************/
        $scope.openInfoPanel = function(elementType, elementId) {
            var mod = document.createElement("panel-info");
            mod.setAttribute("type", elementType);
            mod.setAttribute("id", elementId);
            mod.setAttribute("parent", $scope.infoPanelParent);
            jQuery("#"+ $scope.infoPanelParent).append(mod);
            $compile(mod)($scope);
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

        /******** Interactor Manager ********/
        $scope.clearInteractor = function() {
            document.getElementById("interactorNavigate").className="btn btn-default";
            document.getElementById("interactorInformation").className="btn btn-default";
            document.getElementById("interactorFocus").className="btn btn-default";
            document.getElementById("interactorDragNode").className="btn btn-default";
            document.getElementById("interactorDescriptionLabel").innerHTML = "";
        }

        $scope.setInteractorNavigate = function () {
            $scope.clearInteractor();
            $scope.interactor="navigate";
            document.getElementById("interactorNavigate").className="btn btn-primary";
            document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorNavigate").attr("data-title");
        }

        $scope.setInteractorInformation = function () {
            $scope.clearInteractor();
            $scope.interactor="information";
            document.getElementById("interactorInformation").className="btn btn-primary";
            document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorInformation").attr("data-title");
        }

        $scope.setInteractorFocus = function () {
            $scope.clearInteractor();
            $scope.interactor="focus";
            document.getElementById("interactorFocus").className="btn btn-primary";
            document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorFocus").attr("data-title");
        }

        $scope.setInteractorDragNode = function () {
            $scope.clearInteractor();
            $scope.interactor="dragNode";
            document.getElementById("interactorDragNode").className="btn btn-primary";
            document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorDragNode").attr("data-title");
        }

        /*** Search Bar Catcher *****/
        $rootScope.$watch('search', function(newVal) {
            var locateTmp = [];
            if(newVal != undefined) {
                if( newVal.uid != undefined) {
                    locateTmp.push(newVal.uid);
                    postTypeAddUser(newVal.uid, newVal.name, false);
                }
                else if( newVal.pid != undefined) {
                    locateTmp.push(newVal.pid);
                }
                else if( newVal.cid != undefined) {
                    locateTmp.push(newVal.cid);
                }
                else if( newVal.tag_id != undefined) {
                    $scope.generateGraph(newVal.tag_id);
                }
                if (!$scope.drawGraphPromise.$resolved) // todo do not wait but cancel the promise
                    $timeout(function() {$scope.locate = locateTmp;}, 5000);
                else
                    $scope.locate = locateTmp;
            }
        });
        $scope.$on("$destroy", function(){
            //todo stop all active request
            // remove watchers in rootScope
            angular.forEach($rootScope.$$watchers, function(watcher, key) {
                if(watcher.exp === 'search' || watcher.exp === 'ready') {
                    $rootScope.$$watchers.splice(key, 1);
                }
            });
        });
    });
