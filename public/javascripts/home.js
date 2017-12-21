$( document ).ready(function() {
   $('.editbtn').click(function(){  
    var $item = $(this).closest('tr').children()

    //console.log($item.innerHTML)
    $('#name').attr('value',$item[0].innerHTML)
    $('#Prénom').attr('value',$item[1].innerHTML)
    $('#mobile').attr('value',$item[2].innerHTML)
    $('#email').attr('value',$item[3].innerHTML)
    $('#id').attr('value',$item[4].innerHTML)
    
    $('#editing').show();   
   
   })
  
});

