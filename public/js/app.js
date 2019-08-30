'use strict';

$('.selectButton').click(function() {
  $(this).next().toggleClass('hide');
});

$('#update_button').click(function() {
  $('#update-form').toggleClass('hide');
});

$('#hamburglar').click(function() {
  console.log('clicked');
  $('nav').toggleClass('hide_nav');
});
