(function ($) {
    "use strict";
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Vendor carousel
    $('.vendor-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:2
            },
            576:{
                items:3
            },
            768:{
                items:4
            },
            992:{
                items:5
            },
            1200:{
                items:6
            }
        }
    });


    // Related carousel
    $('.related-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:3
            },
            992:{
                items:4
            }
        }
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:3
            },
            992:{
                items:4
            }
        }
    });


    // Product Quantity
    $('.quantity button').on('click', function () {
        var button = $(this);
        var oldValue = button.parent().parent().find('input').val();
        if (button.hasClass('btn-plus')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        button.parent().parent().find('input').val(newVal);
    });
    
    // ====== SHOPPING CART FEATURE ======
    // Initialize cart from localStorage
    function initCart() {
        var cart = JSON.parse(localStorage.getItem('cart')) || [];
        updateCartCount(cart.length);
    }

    function updateCartCount(count) {
        // Update the shopping cart badge in navbar (both mobile and desktop versions)
        // Find all shopping cart icons and update the adjacent badge
        $('.fa-shopping-cart').each(function() {
            $(this).parent().find('.badge').text(count);
        });
    }

    // Add to cart button (shopping cart icon)
    $(document).on('click', '.product-action a:has(.fa-shopping-cart)', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        var $productItem = $(this).closest('.product-item');
        var productName = $productItem.find('.h6').text().trim();
        var productPrice = $productItem.find('h5').text().trim();
        var productImg = $productItem.find('img').attr('src');
        
        if (!productName) {
            alert('Could not get product name');
            return;
        }
        
        var product = {
            name: productName,
            price: productPrice,
            img: productImg,
            id: Date.now()
        };

        var cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show success message
        alert(productName + ' added to cart!');
        updateCartCount(cart.length);
    });

    // ====== LIKED PRODUCTS FEATURE ======
    function initLiked() {
        var liked = JSON.parse(localStorage.getItem('likedProducts')) || [];
        updateLikeButtons(liked);
        updateLikeCount(liked.length);
    }

    function updateLikeCount(count) {
        // Update the heart/wishlist badge in navbar (both mobile and desktop versions)
        // Find all heart icons and update the adjacent badge
        $('.fa-heart').each(function() {
            // Only update if it's in the navbar (not product items)
            if ($(this).closest('.product-item').length === 0) {
                $(this).parent().find('.badge').text(count);
            }
        });
    }

    function updateLikeButtons(liked) {
        $('.product-action .fa-heart').each(function () {
            var productName = $(this).closest('.product-item').find('.h6').text();
            var isLiked = liked.some(item => item.name === productName);
            if (isLiked) {
                $(this).addClass('text-danger').removeClass('far').addClass('fas');
            } else {
                $(this).removeClass('text-danger').addClass('far').removeClass('fas');
            }
        });
    }

    // Heart icon click (like product)
    $(document).on('click', '.product-action a:has(.fa-heart)', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        var $heart = $(this).find('.fa-heart');
        var $productItem = $heart.closest('.product-item');
        var productName = $productItem.find('.h6').text().trim();
        var productPrice = $productItem.find('h5').text().trim();
        var productImg = $productItem.find('img').attr('src');
        
        if (!productName) {
            alert('Could not get product name');
            return;
        }
        
        var product = {
            name: productName,
            price: productPrice,
            img: productImg,
            id: Date.now()
        };

        var liked = JSON.parse(localStorage.getItem('likedProducts')) || [];
        var index = liked.findIndex(item => item.name === productName);
        
        if (index > -1) {
            // Remove from liked
            liked.splice(index, 1);
            $heart.removeClass('text-danger fas').addClass('far');
            alert(productName + ' removed from liked products');
        } else {
            // Add to liked
            liked.push(product);
            $heart.addClass('text-danger fas').removeClass('far');
            alert(productName + ' added to liked products!');
        }
        
        localStorage.setItem('likedProducts', JSON.stringify(liked));
        updateLikeCount(liked.length);
    });

    // ====== CART PAGE DISPLAY ======
    function displayCartItems() {
        var cart = JSON.parse(localStorage.getItem('cart')) || [];
        var $cartTableBody = $('#cartTableBody');
        var $subtotal = $('#subtotal');
        var $total = $('#total');
        
        if (!$cartTableBody.length) {
            // Not on cart page
            return;
        }
        
        $cartTableBody.empty();
        
        if (cart.length === 0) {
            $cartTableBody.html('<tr><td colspan="5" class="text-center py-4">Your cart is empty. <a href="shop.html">Continue shopping</a></td></tr>');
            $subtotal.text('UGX 0');
            $total.text('UGX 0');
            return;
        }
        
        var subtotalAmount = 0;
        
        cart.forEach(function(product, index) {
            // Parse price - remove "UGX" and commas
            var priceText = product.price || '0';
            var priceNumber = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
            subtotalAmount += priceNumber;
            
            var row = '<tr>' +
                '<td class="align-middle">' +
                    '<img src="' + (product.img || 'img/default.jpg') + '" alt="" style="width: 50px; margin-right: 10px;">' +
                    product.name +
                '</td>' +
                '<td class="align-middle">' + product.price + '</td>' +
                '<td class="align-middle">' +
                    '<div class="input-group quantity mx-auto" style="width: 100px;">' +
                        '<div class="input-group-btn">' +
                            '<button class="btn btn-sm btn-primary btn-minus" data-index="' + index + '"><i class="fa fa-minus"></i></button>' +
                        '</div>' +
                        '<input type="text" class="form-control form-control-sm bg-secondary border-0 text-center" value="1" readonly>' +
                        '<div class="input-group-btn">' +
                            '<button class="btn btn-sm btn-primary btn-plus" data-index="' + index + '"><i class="fa fa-plus"></i></button>' +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '<td class="align-middle">' + product.price + '</td>' +
                '<td class="align-middle"><button class="btn btn-sm btn-danger remove-from-cart" data-index="' + index + '"><i class="fa fa-times"></i></button></td>' +
                '</tr>';
            
            $cartTableBody.append(row);
        });
        
        var totalAmount = subtotalAmount;
        $subtotal.text('UGX ' + subtotalAmount.toLocaleString());
        $total.text('UGX ' + totalAmount.toLocaleString());
    }

    // Remove item from cart
    $(document).on('click', '.remove-from-cart', function() {
        var index = $(this).data('index');
        var cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(cart.length);
        displayCartItems();
    });

    // ====== WHATSAPP ORDER SUBMISSION ======
    $(document).on('click', '#placeOrderBtn', function(e) {
        e.preventDefault();
        
        var customerName = $('#customerName').val().trim();
        var customerPhone = $('#customerPhone').val().trim();
        var customerLocation = $('#customerLocation').val().trim();
        
        console.log('Form Values:');
        console.log('Name: "' + customerName + '"');
        console.log('Phone: "' + customerPhone + '"');
        console.log('Location: "' + customerLocation + '"');
        
        if (!customerName) {
            alert('Please enter your full name');
            $('#customerName').focus();
            return;
        }
        if (!customerPhone) {
            alert('Please enter your mobile number');
            $('#customerPhone').focus();
            return;
        }
        if (!customerLocation) {
            alert('Please enter your location/address');
            $('#customerLocation').focus();
            return;
        }
        
        var cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Build order message - simplified format without special characters
        var orderMsg = 'NEW ORDER FROM KB PLUMBING & GLASSMART\n\n';
        orderMsg += 'CUSTOMER DETAILS:\n';
        orderMsg += 'Name: ' + customerName + '\n';
        orderMsg += 'Phone: ' + customerPhone + '\n';
        orderMsg += 'Location: ' + customerLocation + '\n\n';
        orderMsg += 'ITEMS ORDERED:\n';
        orderMsg += '========================\n';
        
        var totalAmount = 0;
        
        cart.forEach(function(product, index) {
            var priceNumber = parseInt((product.price || '0').replace(/[^\d]/g, '')) || 0;
            totalAmount += priceNumber;
            
            orderMsg += (index + 1) + '. ' + product.name + '\n';
            orderMsg += '   Price: ' + product.price + '\n';
            orderMsg += '\n';
        });
        
        orderMsg += '========================\n';
        orderMsg += 'TOTAL: UGX ' + totalAmount.toLocaleString() + '\n\n';
        orderMsg += 'Please confirm this order. Thank you!';
        
        console.log('Message to send:', orderMsg);
        
        // WhatsApp number (international format without + symbol)
        var whatsappPhone = '256759347774';
        var whatsappUrl = 'https://wa.me/' + whatsappPhone + '?text=' + encodeURIComponent(orderMsg);
        
        console.log('WhatsApp URL:', whatsappUrl);
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Clear form
        $('#checkoutForm')[0].reset();
        
        // Clear cart after 2 seconds to allow WhatsApp to open
        setTimeout(function() {
            localStorage.setItem('cart', JSON.stringify([]));
            updateCartCount(0);
            displayCartItems();
            alert('Order sent! Our team will contact you shortly to confirm.');
        }, 2000);
    });

    // ====== CONTACT FORM - WHATSAPP MESSAGE ======
    $(document).on('click', '#sendContactBtn', function(e) {
        e.preventDefault();
        
        var contactName = $('#contactName').val().trim();
        var contactEmail = $('#contactEmail').val().trim();
        var contactSubject = $('#contactSubject').val().trim();
        var contactMessage = $('#contactMessage').val().trim();
        
        if (!contactName) {
            alert('Please enter your name');
            $('#contactName').focus();
            return;
        }
        if (!contactEmail) {
            alert('Please enter your email');
            $('#contactEmail').focus();
            return;
        }
        if (!contactSubject) {
            alert('Please enter a subject');
            $('#contactSubject').focus();
            return;
        }
        if (!contactMessage) {
            alert('Please enter your message');
            $('#contactMessage').focus();
            return;
        }
        
        // Build WhatsApp message
        var whatsappMsg = 'NEW CONTACT MESSAGE FROM KB PLUMBING & GLASSMART\n\n';
        whatsappMsg += 'SENDER DETAILS:\n';
        whatsappMsg += 'Name: ' + contactName + '\n';
        whatsappMsg += 'Email: ' + contactEmail + '\n\n';
        whatsappMsg += 'SUBJECT: ' + contactSubject + '\n\n';
        whatsappMsg += 'MESSAGE:\n';
        whatsappMsg += '========================\n';
        whatsappMsg += contactMessage + '\n';
        whatsappMsg += '========================\n\n';
        whatsappMsg += 'Please respond to this contact inquiry. Thank you!';
        
        // WhatsApp number
        var whatsappPhone = '256759347774';
        var whatsappUrl = 'https://wa.me/' + whatsappPhone + '?text=' + encodeURIComponent(whatsappMsg);
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Clear form
        $('#contactForm')[0].reset();
        
        // Show success message
        alert('Message sent to WhatsApp! We will get back to you shortly.');
    });

    // Checkout: validate, show preview modal, then send
    $(document).on('click', '#checkoutPlaceOrderBtn', function (e) {
        e.preventDefault();

        // clear previous validation
        $('#billingFirstName, #billingPhone, #billingAddress1').removeClass('is-invalid');

        var fname = ($('#billingFirstName').val() || '').trim();
        var lname = ($('#billingLastName').val() || '').trim();
        var email = ($('#billingEmail').val() || '').trim();
        var phone = ($('#billingPhone').val() || '').trim();
        var addr1 = ($('#billingAddress1').val() || '').trim();
        var addr2 = ($('#billingAddress2').val() || '').trim();
        var city = ($('#billingCity').val() || '').trim();
        var state = ($('#billingState').val() || '').trim();
        var zip = ($('#billingZip').val() || '').trim();
        var country = ($('#billingCountry').val() || '').trim();

        // Basic inline validation
        var hasError = false;
        if (!fname) { $('#billingFirstName').addClass('is-invalid'); hasError = true; }
        if (!phone) { $('#billingPhone').addClass('is-invalid'); hasError = true; }
        if (!addr1) { $('#billingAddress1').addClass('is-invalid'); hasError = true; }
        if (hasError) {
            alert('Please fill the highlighted required fields (name, phone, address).');
            return;
        }

        var cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Your cart is empty. Add items before placing an order.');
            return;
        }

        // Build message preview
        var msg = 'NEW ORDER FROM KB PLUMBING & GLASSMART\n\n';
        msg += 'CUSTOMER:\n';
        msg += 'Name: ' + fname + ' ' + lname + '\n';
        msg += 'Email: ' + (email || 'N/A') + '\n';
        msg += 'Phone: ' + phone + '\n';
        msg += 'Address: ' + addr1 + (addr2 ? (', ' + addr2) : '') + ', ' + city + ', ' + state + ', ' + zip + ', ' + country + '\n\n';

        msg += 'ITEMS ORDERED:\n';
        msg += '---------------------------\n';
        var total = 0;
        cart.forEach(function (p, i) {
            var priceNum = parseInt((p.price || '0').replace(/[^\d]/g, '')) || 0;
            total += priceNum;
            msg += (i + 1) + '. ' + p.name + ' - ' + (p.price || 'N/A') + '\n';
            if (p.img) msg += '   Image: ' + p.img + '\n';
        });
        msg += '---------------------------\n';
        msg += 'TOTAL: UGX ' + total.toLocaleString() + '\n\n';
        msg += 'Please confirm and advise delivery details. Thank you.';

        // Populate preview modal text and show it
        $('#orderPreviewContent').text(msg);
        
        // Build product images gallery
        var imagesHtml = '';
        cart.forEach(function (p) {
            if (p.img) {
                imagesHtml += '<div style="margin-bottom:15px; text-align:center;">';
                imagesHtml += '<img src="' + p.img + '" style="max-width:100%; max-height:120px; border-radius:4px; margin-bottom:5px;" alt="' + (p.name || 'Product') + '">';
                imagesHtml += '<div style="font-size:12px;"><strong>' + (p.name || 'Product') + '</strong></div>';
                imagesHtml += '<div style="font-size:11px; color:#666;">' + (p.price || 'N/A') + '</div>';
                imagesHtml += '</div>';
            }
        });
        $('#orderPreviewImages').html(imagesHtml);
        
        var whatsappPhone = '256759347774';
        var whatsappUrl = 'https://wa.me/' + whatsappPhone + '?text=' + encodeURIComponent(msg);
        $('#confirmSendWhatsappBtn').data('whatsappUrl', whatsappUrl);
        $('#orderPreviewModal').modal('show');
    });

    // Confirm send from modal
    $(document).on('click', '#confirmSendWhatsappBtn', function () {
        var whatsappUrl = $(this).data('whatsappUrl');
        if (!whatsappUrl) return;
        window.open(whatsappUrl, '_blank');
        // Clear cart after short delay
        setTimeout(function () {
            localStorage.setItem('cart', JSON.stringify([]));
            updateCartCount(0);
            displayCartItems();
        }, 1500);
        $('#orderPreviewModal').modal('hide');
    });

    $(document).ready(function () {
        initCart();
        initLiked();
        displayCartItems();
    });
    
})(jQuery);

