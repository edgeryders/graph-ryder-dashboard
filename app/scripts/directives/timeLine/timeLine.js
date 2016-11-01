/**
 * Created by nferon on 06/06/16.
 */
angular.module('sbAdminApp')
    .directive('timeLine', function() {
    return {
        restrict: 'E',
        template: '<svg></svg>',
        scope: {
            height: '@',
            data: '=',
            callBack: '&'
        },
        link: function (scope, element) {

            var margin = {top: 20, right: 20, bottom: 30, left: 50};
            var width = element.parent().width();
            width = width - margin.left - margin.right;

            var x = d3.time.scale()
                .range([0, width]);

            var y1 = d3.scale.linear()
                .range([scope.height, 0]);

            // var y2 = d3.scale.linear()
            //     .range([scope.height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis1 = d3.svg.axis()
                .scale(y1)
                .orient("left");

            // var yAxis2 = d3.svg.axis()
            //     .scale(y2)
            //     .orient("right");

            var brush = d3.svg.brush()
                .x(x)
                .on("brush", brushed)
                .on("brushend", released);

            var usersLine = d3.svg.line()
                .x(function(d) { return x(d.timestamp); })
                .y(function(d) { return y1(d.count); });

            var postsLine = d3.svg.line()
                .x(function(d) { return x(d.timestamp); })
                .y(function(d) { return y1(d.count); });

            var commentsLine = d3.svg.line()
                .x(function(d) { return x(d.timestamp); })
                .y(function(d) { return y1(d.count); });

            var svg = d3.select(element[0].firstChild)
                .attr("width", width + margin.top + margin.bottom)
                .attr("height", Number(scope.height) + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            scope.$watch("data", function(data) {
                if(data.length != 0) {
                    var scale = data.users.concat(data.posts);
                    scale = scale.concat(data.comments);
                    x.domain(d3.extent(scale, function (d) {
                        return d.timestamp;
                    }));
                    y1.domain(d3.extent(scale, function (d) {
                        return d.count;
                    }));
                    // y2.domain(d3.extent(data.posts, function (d) {
                    //     return d.count;
                    // }));

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + scope.height + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis1)
                        .append("text")
                        .attr("transform", "translate(50,0)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Count");

                    // svg.append("g")
                    //     .attr("class", "y axis")
                    //     .attr("transform", "translate(" + (width - 25) + ",0)")
                    //     .style("fill", "green")
                    //     .call(yAxis2)
                    //     .append("text")
                    //     .attr("transform", "rotate(-90)")
                    //     .style("text-anchor", "end")
                    //     .text("Posts");

                    svg.append("path")
                        .datum(data.users)
                        .attr("class", "userLine")
                        .attr("d", usersLine);

                    svg.append("path")
                        .datum(data.posts)
                        .attr("class", "postLine")
                        .attr("d", postsLine);

                    svg.append("path")
                        .datum(data.comments)
                        .attr("class", "commentLine")
                        .attr("d", commentsLine);

                    svg.append("g")
                        .attr("class", "x brush")
                        .call(brush)
                        .selectAll("rect")
                        .attr("y", -6)
                        .attr("height", scope.height + 7);
                    }
                });

            function brushed() {
                scope.callBack()(brush.extent()[0], brush.extent()[1]);
            }
            function released() {
                scope.callBack()(false, false);
            }

            d3.select(window).on('resize', function () {
                //todo redraw
            });


        }
    }
});
