(function( $, undefined ) {

$.widget('widget.barRaphaelOpenClosed', $.Open311.barRaphael, {
  options: {
    title: 'Open and Closed Service Requests'
  },

  _create: function() {
    this.updateContent('');
    var self = this;
    self._bindEvents();
  },
  
  _bindEvents: function(){
    var self = this;
    
    $($.Open311).bind('open311-pass-dates', function(event, fromDate, toDate){
      var dataOpen;
      var dataClosed;
      function getOpenData(){
	return $.ajax({
		  url: 'http://ec2-50-17-130-61.compute-1.amazonaws.com:5984/service-requests/_design/requests/_view/open_byday_ordered_ms?group=true&startkey=' + fromDate + '&endkey=' + toDate,
		  dataType: 'jsonp',
		  success: function(data) {
		    dataOpen = data;
		  }
		});
      }
      
      function getClosedData(){
	return $.ajax({
		  url: 'http://ec2-50-17-130-61.compute-1.amazonaws.com:5984/service-requests/_design/requests/_view/closed_byday_ordered_ms?group=true&startkey=' + fromDate + '&endkey=' + toDate,
		  dataType: 'jsonp',
		  success: function(data) {
		    dataClosed = data;
		  }
		});
      }
      
      $.when(getOpenData(), getClosedData())
	  .then(function(){
	      self._render(fromDate,toDate,dataOpen, dataClosed);
	  })
	  .fail(function(){
	      console.log('Simultaneous AJAX call failed.');
	  })
    });
  
  },
  
   _render: function(fromDate,toDate,dataOpen, dataClosed) {
     function validateDate(d){
	return d.substring(0,2) + "/" + d.substring(2,4) + "/" + d.substring(4,8);
     }
    
     var self = this;
     this.updateContent('');
    
     var totalData = [];
     for (i=0; i<dataOpen.rows.length; i++){
	totalData[i] = ({"date":dataOpen.rows[i].key, "openCount": dataOpen.rows[i].value});
     }
     
     for (i=0; i<dataClosed.rows.length; i++){
	totalData[i].closedCount = dataClosed.rows[i].value;
     }
    
    var CANVAS_HEIGHT = 170;
    var y_orig = 85;
    var origin = 70;
    var barWidth = 14;
    var spacing = 1;

    var bottomLineLength = 286; //28, 27
    var CANVAS_WIDTH = bottomLineLength + 850; //make this dynamic, based on number of bars

    if (typeof Raphael == 'undefined') {
      return;
    }
    
    //add option for no data
	var paper = Raphael(self.contentContainer[0], CANVAS_WIDTH, CANVAS_HEIGHT);
  	var barsTop = paper.set();
	var barsBottom = paper.set();
	
  	var bottomLine = paper.path("M0 70L" + bottomLineLength + " 70");
  	bottomLine.attr({fill:"grey", "stroke-width":"0"});

    var barTop, barBottom;
    var dayLen = totalData.length;
    for (var i = 0; i < dayLen; i++){
      //***PUT IN OPTION FOR 0 OPEN or 0 CLOSED***
      // Top bar
      barTop = paper.rect(origin+(barWidth+spacing)*i,y_orig,barWidth,0);
      barTop.attr({cursor:"pointer", fill:"#1d8dc3", opacity:.9, href: "http://www.311dashboard.com/closed/" + totalData[i].date, stroke:"none"});		
      barTop.animate({y: y_orig-(totalData[i].closedCount/10), height: (totalData[i].closedCount/10)}, 1000, ">");
      barsTop.push(barTop);
      // Bottom bar
      barBottom = paper.rect(origin+(barWidth+spacing)*i,y_orig,barWidth,0); //70 problem with the bar tooltip
      barBottom.attr({cursor:"pointer", fill:"#ff0033", opacity:.9, href: "http://www.311dashboard.com/open/" + totalData[i].date, stroke:"none"});		
      //cubic-bezier(0.42, 0, 1.0, 1.0)
      barBottom.animate({y: y_orig, height: (totalData[i].openCount/10)}, 1000, ">");
      barsBottom.push(barBottom);
    }
    
        var tooltip = paper.rect(10, 10, 110, 30); //draw as a path
	/*
	//M10 10L110 10L110 30L55 30L60 22L45 30L10 30
	//var tooltop = paper.path("M10 10L110 10L110 30L55 30L60 22L45 30L10 30L10 10");
	var tooltop = paper.path("M10 10L110 10L110 30L65 30L60 38L55 30L10 30L10 10");
	tooltop.attr({fill: "#DBDBDB", opacity: .8,stroke:"none"});
	*/
	var tooltip_text = paper.text(10,10,""); //draw as a path
	tooltip.attr({fill: "#DBDBDB", opacity: .8,stroke:"none"});
	tooltip.hide();
        tooltip_text.hide();
	
	var graphWidth = (origin + dayLen*barWidth + (dayLen-1)*spacing);
	var index;
	var firstDateInData = dataOpen.rows[0].key;
	var lastDateInData = dataOpen.rows[dataOpen.rows.length-1].key;

	var date;
	var label_text_string;
	if (firstDateInData < fromDate){
	  date = new Date(fromDate);
	  var FROM_DATE_IN_MS = fromDate;
	} else {
	  date = new Date(firstDateInData);
	  var FROM_DATE_IN_MS = firstDateInData;
	}
	
	//alert(date);
	/*
	var graph_label = paper.text(200,110,label_text_from_string + " to " + validateDate(toDate));
	graph_label.attr({"font-size": 12});
	*/
	//var date = new Date(validateDate(fromDate)); //this doesn't work when we don't have data starting with the fromDate
						       //also doesn't work when there is no data for a day
	//var FROM_DATE_IN_MS = date.getTime();
	//var FROM_DATE_IN_MS = fromDate;
	//var NUMBER_OF_MS_PER_DAY = 8.64 * 10e7;
	var NUMBER_OF_MS_PER_DAY = 86400000; //24*60*60*1000
	
  	barsTop.mouseover(function () {
  		this.attr({fill:"white",stroke:"grey", opacity:.7, "stroke-width":1, "stroke-linecap":"square"});
		tooltip.show();
                tooltip_text.show();
		//Calculate index for bar text
		//graphWidth = (origin + dayLen*barWidth + (dayLen-1)*spacing); //Math.floor?? 357, 28 bars, 28 days
		//28 * 10 + (28 - 1)*1 + 50 = 357
		index = Math.round(((this.attr('x')/graphWidth) * graphWidth - origin)/(barWidth + spacing));
		//reset the date object
		date.setTime(FROM_DATE_IN_MS + index*NUMBER_OF_MS_PER_DAY); //*****
		//console.log('index: ' + index);
		tooltip.attr({x: this.attr('x')-.5*tooltip.attr('width') + .5*barWidth,y: this.attr('y') - tooltip.attr('height') - 10});
		tooltip_text.attr({text: totalData[index].closedCount + ' Closed Requests\non ' + date.toDateString(), x: this.attr('x') + .5*barWidth, y:this.attr('y') - tooltip.attr('height') + 5});
	});
	
	barsBottom.mouseover(function () {
  		this.attr({fill:"white",stroke:"grey", opacity:.7, "stroke-width":1, "stroke-linecap":"square"});
		tooltip.show();
		tooltip_text.show();
		
		index = Math.round(((this.attr('x')/graphWidth) * graphWidth - origin)/(barWidth + spacing));

		date.setTime(FROM_DATE_IN_MS + index*NUMBER_OF_MS_PER_DAY);
		
		tooltip.attr({x: this.attr('x')-.5*tooltip.attr('width') + .5*barWidth,y: (this.attr('y')-20) + this.attr('height') + tooltip.attr('height') + 20 - 10});
		tooltip_text.attr({text: totalData[index].openCount + ' Open Requests\non ' + date.toDateString(), x: this.attr('x') + .5*barWidth, y: (this.attr('y')-20) + this.attr('height') + tooltip.attr('height') +20 + 5});
	});
	
  	barsTop.mouseout(function() {
  		this.attr({fill:"#1d8dc3", stroke:"none", opacity:.9});
		tooltip.hide();
		tooltip_text.hide();
	});
	
	barsBottom.mouseout(function() {
		this.attr({fill:"#ff0033", stroke:"none", opacity:.9});
		tooltip.hide();
		tooltip_text.hide();
  	});
   },
  destroy: function() {
    $.Widget.prototype.destroy.apply(this, arguments);
  }
});

})( jQuery );
