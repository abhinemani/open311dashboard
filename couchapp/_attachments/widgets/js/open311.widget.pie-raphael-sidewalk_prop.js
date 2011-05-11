(function( $, undefined ) {

$.widget('widget.pieRaphaelSidewalk', $.Open311.pieRaphael, {
  options: {
    title: 'Sidewalk Requests vs Rest',
    dataSource: "http://ec2-50-17-130-61.compute-1.amazonaws.com:5984/service-requests/_design/requests/_view/sidewalk_proportion?group=true"
  },
  
  _create: function() {
    var self = this;
    self._bindEvents();
    this.updateContent('');
    
    $.ajax({
	url: self.options.dataSource,
	dataType: 'jsonp',
	success: function(data) {
          self._render(data);					
        }
    });
  },
  
  _bindEvents: function(){
    var self = this;
  },
  
   _render: function(data) {     
  var self = this;
  this.updateContent('');
      
  if(data.rows.length > 0) {
    var sidewalk_total = data.rows[0].value;
    var the_rest = data.rows[1].value;
    var totReqs = data.rows[0].value + data.rows[1].value;
            
    var pieces =  [
      {title: "Sidewalk Requests", fraction:(sidewalk_total/totReqs).toFixed(2)}, 
      {title: "The Rest", fraction:(the_rest/totReqs).toFixed(2)}
    ];
            
    var colorArray = [];
            
    if (typeof Raphael == 'undefined') {
      return;
    }
  
    if (pieces.length === 2) {
      colorArray = ["#d28a1c", "#8c2633"];
    } else if (pieces.length === 3) {
      colorArray = ["#1d8dc3","#449ac3","#6ba6c3"];
    } else if (pieces.length === 4) {
      colorArray = ["#1d8dc3","#3193c3", "#449ac3", "#58a0c3"];
    } else {
      colorArray = ["#1d8dc3","#3193c3", "#449ac3", "#58a0c3","#6ba6c3"];
    }
  
    var startAngle = 0;
    var Radius = 50;
    var CENTER_X = 100;
    var CENTER_Y = 100;
  
    var i = 0;
    var deltaAngles = [];
    for (i = 0; i < pieces.length; i += 1) {
      deltaAngles[i] = self.convertProportionToDegreesRadian(pieces[i].fraction);
    }

    var canvas = Raphael(self.contentContainer[0], 200, 200);
    var sectorSet = canvas.set();  
  
    for (i = 0; i < pieces.length; i += 1){
      var sector = self.drawSector(startAngle, Radius, CENTER_X, CENTER_Y, deltaAngles[i], {fill: colorArray[i], stroke: "#fff", opacity: 1}, canvas);
      sector.attr({title: pieces[i].fraction*100 + '% ' + pieces[i].title});
      sectorSet.push(sector);
      startAngle = startAngle + deltaAngles[i];
    }
  
    var description = canvas.text(100, 180, "Sidewalk Proportions");
    description.attr({"font-size": 12});
    
    sectorSet.mouseover(function () {
      this.animate({scale: [1.05, 1.05, CENTER_X, CENTER_Y], stroke:"#cccccc"}, 250, "cubic-bezier(0.42, 0, 1.0, 1.0)");
      description.attr({text:this.attr("title")});
      // alert(typeof this.attr("title"));
    })
    .mouseout(function () {
      this.animate({scale: [1, 1, CENTER_X, CENTER_Y], fill:this.attr("fill"), stroke: "#fff"}, 250, "cubic-bezier(0.42, 0, 1.0, 1.0)");
      description.attr({text:"Sidewalk Proportions"});
    });
    
  } else {
    self.valueDiv = $('<div class="no-data">No data.</div>')
    .appendTo(self.contentContainer);
  }
  
  },
  destroy: function() {
    $.Widget.prototype.destroy.apply(this, arguments);
  }
});

})( jQuery );