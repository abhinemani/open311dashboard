/**
 * Comparison of open vs. closed requests for a given timespan for Open311 Dashboard
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget('widget.pieRaphaelOpenClosed', $.Open311.pieRaphael, {
  /**
   * Default options for the widget.  We need some way
   * of communicating the data source across all widgets.
   */
  options: {
      title: 'Open vs Closed in 2011',
    dataSource: "http://open311.couchone.com/service-requests/_design/requests/_view/allbymonth?group=true"
  },
  
  /**
   * Creation code for widget
   */
  _create: function() {
    // Create container to put chart in.
    this.updateContent('');
    var self = this;
    self._bindEvents();
  },
  
  _bindEvents: function(){
    var self = this;
    
    $($.Open311).bind('open311-data-update', function(event, data){
      self._render(data);
    });
  
  },
  
   _render: function(data) {     
  var self = this;
  this.updateContent('');
      
  if(data.service_requests.length > 0) {
    var openReqs = closedReqs = 0;
    
      // Loop through the returned data and count open vs closed
    $(data.service_requests).each(function(index, elm) {
      if (elm.status == "Open") {
        openReqs++;
      } else if (elm.status == 'Closed'){ 
        closedReqs++;
      }
    });
            
    var totReqs = openReqs+closedReqs;
            
    var pieces =  [
      {status: "Open", fraction:(openReqs/totReqs).toFixed(2)}, 
      {status: "Closed", fraction:(closedReqs/totReqs).toFixed(2)}
    ];
            
    var colorArray = [];
            
      // Check for Raphael
    if (typeof Raphael == 'undefined') {
      return;
    }
  
    // Deal with colors
    if (pieces.length === 2) {
      colorArray = ["#D2E9F3", "#1d8dc3"];
    } else if (pieces.length === 3) {
      colorArray = ["#1d8dc3","#449ac3","#6ba6c3"];
    } else if (pieces.length === 4) {
      colorArray = ["#1d8dc3","#3193c3", "#449ac3", "#58a0c3"];
    } else {
      // fix this later; implement some kind of spectrum for high number of sectors
      colorArray = ["#1d8dc3","#3193c3", "#449ac3", "#58a0c3","#6ba6c3"];
    }
  
    var startAngle = 0; //Start Angle of Each Slice
    var Radius = 50;
    var CENTER_X = 100; //X-coordinate of the circle's center
    var CENTER_Y = 100; //Y-coordinate of the circle's center
  
    //Compute the delta angles; the angles for each sector.
    var i = 0;
    var deltaAngles = [];
    for (i = 0; i < pieces.length; i += 1) {
      deltaAngles[i] = self.convertProportionToDegreesRadian(pieces[i].fraction);
      //fix scoping
      //deltaAngles[i] = pieces[i].fraction * 2 * Math.PI;
    }
    //console.log(deltaAngles);
    //console.log(openReqs);
    //console.log(closedReqs);
  
    // Creates canvas 200 × 200 at 0, 0; canvas starts in the upper left hand corner of the browser
    var canvas = Raphael(self.contentContainer[0], 200, 200);
    // set() creates an array-like object, to deal with several elements at once.
    var sectorSet = canvas.set();  
  
    for (i = 0; i < pieces.length; i += 1){
      var sector = self.drawSector(startAngle, Radius, CENTER_X, CENTER_Y, deltaAngles[i], {fill: colorArray[i], stroke: "#fff", opacity: 1}, canvas);
      sector.attr({title: pieces[i].fraction*100 + '% ' + pieces[i].status});
      sectorSet.push(sector);
      startAngle = startAngle + deltaAngles[i];
    }
  
    // Text that describes various portions of the pie chart
    var description = canvas.text(100, 180, "Open and Closed Service Requests");
    description.attr({"font-size": 12});
  
    //Handle the mouseover
    
    sectorSet.mouseover(function () {
      this.animate({scale: [1.05, 1.05, CENTER_X, CENTER_Y], stroke:"#cccccc"}, 250, "cubic-bezier(0.42, 0, 1.0, 1.0)");
      description.attr({text:this.attr("title")});
      // alert(typeof this.attr("title"));
    })
    .mouseout(function () {
      this.animate({scale: [1, 1, CENTER_X, CENTER_Y], fill:this.attr("fill"), stroke: "#fff"}, 250, "cubic-bezier(0.42, 0, 1.0, 1.0)");
      description.attr({text:"Open and Closed Service Requests"});
    });
    
  } else {
    self.valueDiv = $('<div class="no-data">No data.</div>')
    .appendTo(self.contentContainer);
  }
  
  },
  
  /**
   * Destroy widget
   */
  destroy: function() {
    // Default destroy
    $.Widget.prototype.destroy.apply(this, arguments);
  }
});

})( jQuery );