
angular.module('sbAdminApp')
    .directive('panelInfo', function ($resource, config, $q, $compile) {
return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            type: '@', 
            id: '@',
            parent: '@'
        },
        link: function (scope, element) {

            scope.openInfoPanel = function(elementType, event) {
                var elementId = event.target.id;
                if($("#"+elementType+"_"+elementId).length) {
                    scope.bringInfoPanelUpward(elementType+"_"+elementId);
                } else {
                    scope.createInfoPanel(elementType, elementId);
                }
            };

            scope.bringInfoPanelUpward = function(idInfoPanel) {
                var popzone = document.getElementById(scope.parent);
                var elem = document.getElementById(idInfoPanel);
                if(elem.style.zIndex <= popzone.style.zIndex) {
                    popzone.style.zIndex++;
                    elem.style.zIndex = popzone.style.zIndex;
                }
            };

            scope.createInfoPanel = function(elementType, elementId) {
                var mod = document.createElement("panel-info");
                mod.setAttribute("type", elementType);
                mod.setAttribute("id", elementId);
                mod.setAttribute("parent", scope.parent);
                jQuery(scope.parent).append(mod);
                $compile(mod)(scope);
            }

            scope.closeInfoPanel = function(idInfoPanel) {
                $("#"+idInfoPanel).remove();
            };

            scope.getDate = function (timestamp) {
                function complete(val) {
                    if (val < 10)
                        return "0"+val;
                    else
                        return val;
                };
                var date = new Date(timestamp);
                var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' ' + complete(date.getHours()) + ':' + complete(date.getMinutes());
            };

            //avoid duplicate
            if($("#"+scope.type+"_"+scope.id).length) {
                element[0].remove();
                scope.bringInfoPanelUpward(scope.type+"_"+scope.id);
                return;
            }

            scope.comment = "";
            scope.post = "";
            scope.tag = "";
            scope.user = "";
            switch(scope.type) {
                case "user":
                    //$scope.user={user_id: "", name: "", active: "", url_facebook: "", url_twitter: "", url_website: "", email: "", location: "", age: "", biography: "", posts: "", comments: ""};
                    var User = $resource(config.apiUrl + "users/hydrate/" + scope.id);
                    var userP = User.get();
                    userP.$promise.then(function (result) {
                        //$scope.loading = false;
                        scope.user = result;
                    });
                    break;
                case "post":
                    //$scope.post={post_id: "", title: "", timestamp: "", author: "", content: "", comments: "", annotations: ""};
                    var Post = $resource(config.apiUrl + "post/hydrate/" + scope.id);
                    var postP = Post.get();
                    postP.$promise.then(function (result) {
                        //$scope.loading = false;
                        scope.post = result;
                    });
                    break;
                case "comment":
                    //$scope.comment={comment_id: "", title: "", timestamp: "", author: "", post: "", content: "", annotations: ""};
                    var Comment = $resource(config.apiUrl + "comment/hydrate/" + scope.id);
                    var commentP = Comment.get();
                    commentP.$promise.then(function (result) {
                        //$scope.loading = false;
                        scope.comment = result;
                    });
                    break;
                case "tag":
                    //$scope.tag={tag_id: "", label: "", posts: "", comments: ""};
                    var Tag = $resource(config.apiUrl + "tag/hydrate/" + scope.id);
                    var tagP = Tag.get();
                    tagP.$promise.then(function (result) {
                        //$scope.loading = false;
                        scope.tag = result;
                    });
                    break;
                default:
                    console.log("error with panelView directive unknow type");
            }

            var mod = element[0];
            mod.className = "panel panel-default";
            mod.id = scope.type+"_"+scope.id;
            scope.panelViewCrtZindex =  document.getElementById(scope.parent).style.zIndex;
            mod.style = "position: absolute; z-index: "+scope.panelViewCrtZindex+"; width: 30%; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);"
            mod.innerHTML='<div class="panel-heading" ng-mousedown="bringInfoPanelUpward(\''+mod.id+'\')" >'+
                    '        <button type="button" class="close" aria-hidden="true" ng-click="closeInfoPanel(\''+mod.id+'\')" >&times;</button>'+
                    '        <div id="panel-heading-content"><h4 class="modal-title" >Loading...</h4></div>'+
                    '    </div>';
            var footer ='<div class="panel-footer">'+
                    '    <button class="btn btn-default" ng-click="closeInfoPanel(\''+mod.id+'\')" >Close</button>'+
                    '</div>';
            jQuery("#"+scope.parent).append(mod);
            $("#"+mod.id).draggable({
              handle: ".panel-heading"
            });
            $.ajax('views/ui-elements/drag-panel-view-head-'+scope.type+'.html', {success: 
              function(responseHeadData) {
                $.ajax('views/ui-elements/drag-panel-view-body-'+scope.type+'.html', {success: 
                  function(responseBodyData) {
                    mod.insertAdjacentHTML('beforeend', responseBodyData);
                    mod.insertAdjacentHTML('beforeend', footer);
                    $("#"+mod.id).find("#panel-heading-content").html(responseHeadData);
                    //var tmp = $compile(mod)(scope);
                    $compile($("#"+mod.id).find(".panel-heading"))(scope);
                    $compile($("#"+mod.id).find(".panel-body"))(scope);
                    $compile($("#"+mod.id).find(".panel-footer"))(scope);
                  }
                });
              }
            });
        }
    };
});
