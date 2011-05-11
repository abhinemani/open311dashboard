(function( $, undefined ) {
$('.top-open-requests').barchartGoogleTopOpenRequests();
$('.open-vs-closed-bar').barRaphaelOpenClosed();
//$('.neighborhoods-sc-trends').neighborhoodsSCTrends();
$('.open-vs-closed').pieRaphaelOpenClosed();
$('.sidewalk-proportion').pieRaphaelSidewalk();
$('.sidewalk-open-closed').pieRaphaelSidewalkOpenClosed();
$('.neighborhood-proportion').pieRaphaelNeighborhood();
//$('.map-google-example').mapGoogleExample({dataSource: 'data/ServiceRequests_Complete.json'});
$('#search').searchType();

})( jQuery );
