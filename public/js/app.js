'use strict';

$('.selectButton').click(function() {
  $(this).next().toggleClass('hide');
});

$('#update_button').click(function() {
  console.log('Clicked');
  $('.hide').toggleClass('hide');
})