;$(function () {
    $(".reviews__slider").slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        adaptiveHeight: true,
        dots: false,
        Infinite: true,
        variableWidth: true,
    });
});

$(function () {
    $(".service__slider").slick({
        slidesToShow: 3,
        slidesToScroll: 2,
        arrows: false,
        adaptiveHeight: true,
        dots: true,
        Infinite: true,
        variableWidth: true,
    });
});