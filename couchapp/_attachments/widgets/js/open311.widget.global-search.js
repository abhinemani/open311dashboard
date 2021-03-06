/**
 * Search widget for Open311 Dashboard
 * This is widget queries for Open311 data and
 * then publishes it to whoever is listening.
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget('Open311.searchType', $.Open311.globalInput, {
  options: {
    title: ' ',
    titleClass: 'ui-input-widget-header',
   contentClass: 'ui-input-widget-content'
  },
  
  _create: function() {
    var self = this, dates;
    this.updateContent('<label for="open311-fromdate"></label><input type="text" class="open311-fromdate" name="open311-fromdate"/>' +
      '<label for="open311-todate"> - </label><input type="text" class="open311-todate" name="open311-todate"/>' +
      '<button class="open311-search-button">Search</button></div>');
        
    dates = $( '.open311-fromdate, .open311-todate', this.element ).datepicker({
      changeMonth: true,
      onSelect: function( selectedDate ) {
        var $this = $(this),
            option = $this.hasClass('open311-fromdate') ? 'minDate' : 'maxDate',
            instance = $this.data( 'datepicker' ),
            date = $.datepicker.parseDate(
              instance.settings.dateFormat ||
              $.datepicker._defaults.dateFormat,
              selectedDate, instance.settings );
            
            dates.not(this).datepicker('option', option, date );
      }
    });
    this._$fromDate = $(dates[0]).datepicker('setDate', '-71d');
    this._$toDate = $(dates[1]).datepicker('setDate', '-1d');
    
    self._bindEvents();
    self.search();
  },
  
  //Bind any needed events
  _bindEvents: function() {
    //hack to keep access to the widget instance inside of the click callback
    var self = this;
    
    $('.open311-search-button', this.element).click(function(){
      self.search();
    });
  },
  
  //Search for 311 requests by date range and publish them
  search: function(fromDate, toDate){
    var self = this,
      toRfc3339 = function(d){
         function pad(n){return n<10 ? '0'+n : n;};

        return d.getUTCFullYear()+'-' + 
          pad(d.getUTCMonth()+1)+'-' + 
          pad(d.getUTCDate())+'T' + 
          pad(d.getUTCHours())+':' + 
          pad(d.getUTCMinutes())+':' + 
          pad(d.getUTCSeconds())+'Z';
      },
      
      //Convert to a format of MMDDYYYY
      convertDate = function(d){
        function pad(n){return n<10 ? '0'+n : n;};

        return pad(d.getUTCMonth()+1) +
          pad(d.getUTCDate()) +
          d.getUTCFullYear();
      };

    fromDate = fromDate || self._$fromDate.datepicker('getDate');
    toDate = toDate || self._$toDate.datepicker('getDate');
    
    //trigger before the ajax call

    //$($.Open311).trigger('open311-pass-dates', [convertDate(fromDate).getTime(), convertDate(toDate).getTime()]);
    console.log(fromDate.getTime());
    console.log(toDate.getTime());
    $($.Open311).trigger('open311-pass-dates', [fromDate.getTime(), toDate.getTime()]);
    /*
    $.ajax({
      url: 'http://open311.couchone.com/service-requests/_design/requests/_list/requests-json/allbytime',
      //send each widget the dates to look at; not the data
      dataType: 'jsonp',
      data: {
        startkey:'"'+toRfc3339(fromDate)+'"',
        endkey:'"'+toRfc3339(toDate)+'"'
      },
       success: function(data) {
        $($.Open311).trigger('open311-data-update', [data]);
      }
    });
    */
  },
  destroy: function() {
    $.Widget.prototype.destroy.apply(this, arguments);
  }
});

})( jQuery );