$(document).ready(function() {
 $('.img-container').magnificPopup({
  delegate: 'a', 
  type: 'image',
   gallery:{
    enabled:true
  }
 
});
  $("#logo").owlCarousel({
  	loop:true,
  	margin:10,
  	smartSpeed:4000,
  	nav:true,
  	responsive:{
  		0:{items:1}, 
  		600:{
  			items:3
  		},
  		1000:{
  			items:5
  		}
  	}
  });
});
$(document).ready(function(){
 $("#owl-work").owlCarousel({
    loop:true,
    margin:10,
    smartSpeed:4000,
    nav:true,
    responsive:{
      0:{items:1},
      600:{
        items:3
      },
      1000:{
        items:4
      }
    }
  });
});
// quotes section
$(document).ready(function(){
 $("#customers").owlCarousel({
    loop:true,
    margin:10,
    smartSpeed:4000,
    nav:true,
    responsive:{
      0:{items:1
      },
      600:{
        items:1
      },
      1000:{
        items:1
      }
    }
  });
});

// navbar transition
$(document).ready(function(){
  $(window).scroll(function(){
    var location= $(this).scrollTop();
    if(location<70){
      $('nav').removeClass("transparent");
    }else{
      $('nav').addClass("transparent");
    }
  });
});