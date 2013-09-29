/**
 * Datepicker - lightweight and fast
 * (c) 2013 Cezary Tomczyk - ctomczyk.pl
 * License: http://www.opensource.org/licenses/mit-license.php
 */

(function (global) {
    'use strict';

    var date_picker,
        config,
        re = new RegExp('^(function|object)$', 'i'),
        get_elements_by_class_name,
        has_class,
        add_class,
        is_input_type_date_supported,
        add_event,
        remove_event,
        get_inner_text;

    /* Config */

    config = {
        dateFormat : 'dd-mm-yyyy', // or yyyy-mm-dd

        currentDay : '',
        currentMonth : '',
        currentYear : '',

        previousMonth : '«',
        nextMonth : '»',
        days : ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'],
        months : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        yearsFrom : 2020,
        dateSeparator : '-',
        forceHTML5 : false
    };

    /* End Config */

    function is_host_method(o, m) {
        var t = typeof o[m];
        return Boolean(t === 'unknown' || (re.test(t) && o[m]));
    }

    function is_host_object_property(o, p) {
        var t = typeof o[p];
        return Boolean(re.test(t) && o[p]);
    }

    function get_event_target(e) {
        if (!e) {
            e = global.event;
        }
        return (e.target) ? ((e.target.nodeType === 3) ? e.target.parentNode : e.target) : e.srcElement;
    }

    function get_parent(node, tag) {
        var r = false;

        while (node.parentNode) {
            node = node.parentNode;
            if (((node.nodeType === 1 && node.tagName !== '!') || (!node.nodeType && node.tagName)) && node.nodeName.toLowerCase() === tag) {
                r = node;
                break;
            }
        }
        return r;
    }

    function remove_element_nodes(elm) {
        if (!elm || elm.childNodes.length === 0) {
            return false;
        }
        while (elm.lastChild) {
            elm.removeChild(elm.lastChild);
        }
        return elm;
    }

    function get_current_date() {
        var currDate = new Date();
        // [day, month, year]
        return [
            (currDate.getDate() < 10) ? '0' + currDate.getDate() : currDate.getDate(),
            ((currDate.getMonth()) < 10 ? '0' : '') + (currDate.getMonth() + 1),
            currDate.getFullYear()
        ];
    }

    function get_element_position(el) {
        var posleft = 0,
            postop = 0;

        if (el.offsetParent) {
            posleft = el.offsetLeft;
            postop = el.offsetTop;
            while (el === el.offsetParent) {
                posleft += el.offsetLeft;
                postop += el.offsetTop;
            }
        }
        return [postop, posleft];
    }

    function get_page_size() {
        var xScroll, yScroll, pageWidth, pageHeight, windowWidth, windowHeight;

        if (global.innerHeight && global.scrollMaxY) {
            xScroll = document.body.scrollWidth;
            yScroll = global.innerHeight + global.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight) {
            xScroll = document.body.scrollWidth;
            yScroll = document.body.scrollHeight;
        } else {
            xScroll = document.body.offsetWidth;
            yScroll = document.body.offsetHeight;
        }

        if (global.self.innerHeight) {
            windowWidth = global.self.innerWidth;
            windowHeight = global.self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) {
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }

        // for small pages with total height less then height of the viewport
        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }

        // for small pages with total width less then width of the viewport
        if (xScroll < windowWidth) {
            pageWidth = windowWidth;
        } else {
            pageWidth = xScroll;
        }

        return [pageWidth, pageHeight, windowWidth, windowHeight];
    }

    function get_scroll_xy() {
        var scrOfX = 0, scrOfY = 0;

        if (typeof (global.pageYOffset) === 'number') {
            scrOfY = global.pageYOffset;
            scrOfX = global.pageXOffset;
        } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            scrOfY = document.body.scrollTop;
            scrOfX = document.body.scrollLeft;
        } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            scrOfY = document.documentElement.scrollTop;
            scrOfX = document.documentElement.scrollLeft;
        }
        return [scrOfX, scrOfY];
    }

    get_inner_text = (function () {

        var fn;

        if (is_host_method(document, 'createTreeWalker')) {
            fn = function (root) {
                // 4 = NodeFilter.SHOW_TEXT
                var w = document.createTreeWalker(root, 4, null, false),
                    result = '';
                while (w.nextNode()) {
                    result += w.currentNode.data;
                }
                return result;
            };
        } else {
            fn = function (node) {
                if (node.nodeType === 3) {
                    return node.data;
                }

                var txt = '';

                node = node.firstChild;
                while (node) {
                    txt += fn(node);
                    node = node.nextSibling;
                }
                return txt.replace(/\s+/g, ' ');
            };
        }
        return fn;
    }());

    has_class = (function () {
        var m;

        if (is_host_object_property(document.body, 'classList')) {
            m = function (el, classn) {
                return el.classList.contains(classn);
            };
        } else {
            m = function (el, classn) {
                return (new RegExp('(^|\\s)' + classn + '(\\s|$)')).test(el.className);
            };
        }
        return m;
    }());

    add_class = (function () {
        var m;

        if (is_host_object_property(document.body, 'classList')) {
            m = function (el, classn) {
                // classList.add can only add one class name at once
                var all = classn.split(' '),
                    l = all.length,
                    i;
                for (i = 0; i < l; i += 1) {
                    el.classList.add(all[i]);
                }
            };
        } else {
            m = function (el, classn) {
                var re = new RegExp('(^|\\s)' + classn + '(\\s|$)');
                if (!re.test(el.className)) {
                    el.className += ' ' + classn;
                }
            };
        }
        return m;
    }());

    get_elements_by_class_name = (function () {

        var m;

        if (is_host_method(document, 'getElementsByClassName')) {
            m = function (class_name, context) {
                return (context || global.document).getElementsByClassName(class_name || '');
            };
        } else {
            m = function (class_name, context) {

                var elms = (context || global.document).getElementsByTagName('*'),
                    l = elms.length,
                    result = [],
                    i;

                if (!class_name) {
                    return result;
                }

                for (i = 0; i < l; i += 1) {
                    if (has_class(elms[i], class_name)) {
                        result.push(elms[i]);
                    }
                }
                return result;
            };
        }

        return m;

    }());

    if (is_host_method(global, 'addEventListener')) {

        add_event = function (target, type, listener) {
            target.addEventListener(type, listener, false);
        };

        remove_event = function (target, type, listener) {
            target.removeEventListener(type, listener, false);
        };

    } else if (is_host_method(global, 'attachEvent')) {

        add_event = function (el, sEvent, fpNotify) {
            el.attachEvent('on' + sEvent, fpNotify);
            el = null;
        };

        remove_event = function (el, sEvent, fpNotify) {
            el.detachEvent('on' + sEvent, fpNotify);
        };
    }

    /**
     * Date picker method.
     *
     * @function
     * @param {string} datepicker_class Name of class name which identify that specified HTML element will have date picker
     *
     * The method creates date picker icon next to specified HTML element with specified class name. By default with "datepicker".
     */

    date_picker = {

        /* Basic properties used in date picker */

        selectedDay : '',
        selectedMonth : '',
        selectedYear : '',

        fromInputDay : '',
        fromInputMonth : '',
        fromInputYear : '',

        tabindex : 0,
        prefix_input_id : '_calendar', // Concatenating ID of input and this prefix. Generating ID for datepicker selector link.
        wrapper : null, // store reference to calendar wrapper

        init : function (datepicker_class) {
            if (!datepicker_class) {
                datepicker_class = 'datepicker';
            }
            var elms = get_elements_by_class_name(datepicker_class),
                l = elms.length,
                body = document.body || document.getElementsByTagName('body')[0],
                // Icon for click and hide calendar
                link_icon,
                link_icon_clone,
                img_icon,
                i,
                elms_height,
                wrapper,
                elm = document.createElement('input');

            // Check, if browser support HTML <input> type "date" + if we really want to use it (forceHTML5 must be set to "true")
            elm.setAttribute('type', 'date');
            if (elm.type === 'date' && config.forceHTML5) {
                for (i = 0; i < l; i += 1) {
                    elms[i].setAttribute('type', 'date');
                }
                return;
            }

            // Add class hideDatepickers to <body> for preventing reflow. We'll show all icons after they will be added to DOM
            add_class(body, 'hideDatepickers');

            // Create calendar icon
            img_icon = document.createElement('img');
            img_icon.src = 'images/icoCalendar.png';
            img_icon.width = '16';
            img_icon.height = '16';
            img_icon.alt = 'calendar';

            for (i = 0; i < l; i += 1) {
                link_icon = document.createElement('a');
                link_icon.href = '#' + elms[i].id;
                link_icon.setAttribute('data-inputid', elms[i].id);
                link_icon.className = 'nosmooth selectdate';
                link_icon.role = 'button';
                link_icon.title = 'Select date from date picker';
                link_icon.onclick = date_picker.showhide;
                link_icon.appendChild(img_icon.cloneNode(false));

                // Insert calendar link right after specified element elms[i]
                elms[i].parentNode.insertBefore(link_icon, (elms[i].nextSibling || null));

                // Get height of elms[i] for vertical centering; 16 is a height of calendar image icon
                elms_height = parseInt((elms[i].clientHeight - 16) / 2, 10);
                link_icon.style.position = 'relative';
                link_icon.style.top = elms_height + 'px';
            }

            // Create wrapper for calendar
            wrapper = document.createElement('div');
            wrapper.id = 'smallcalendar';
            wrapper.className = 'minicalendar';
            wrapper.style.display = 'none';
            wrapper.tabIndex = '-1';
            wrapper.setAttribute('role', 'dialog');
            body.appendChild(wrapper);

            // Store reference to wrapper
            date_picker.wrapper = wrapper;

            // Show all date picker icons by removing class name from <body>; 1 reflow
            body.className = body.className.replace(/(^\s*|\s+)hideDatepickers(\s*$|(\s))/, '');
            // Remove unneeded references
            elm = null;
        },

        showhide : function (e) {
            var tar = get_event_target(e),
                t,
                input,
                input_id;

            if (tar.nodeName.toLowerCase() !== 'a') {
                tar = get_parent(tar, 'a');
            }

            // Get <input> id where will be put date string
            input_id = tar.getAttribute('data-inputid');

            input = document.getElementById(input_id);
            if (!input) {
                return false;
            }

            date_picker.printCal(input_id);
            date_picker.cancelEvent(e);
            return true;
        },

        printCal : function (input_id) {
            var destInput = document.getElementById(input_id),
                cal = document.getElementById('smallcalendar'),
                table,
                thead,
                tbody,
                evtpos,
                d;

            // Read current date
            d = get_current_date();
            config.currentDay = parseInt(d[0], 10);
            config.currentMonth = parseInt(d[1], 10) - 1;
            config.currentYear = d[2];

            // Read date from <input>
            date_picker.read(destInput);

            // Clearing calendar
            remove_element_nodes(date_picker.wrapper);

            // Remember input id
            date_picker.wrapper.input_id = input_id;

            // Calendar table
            table = document.createElement('table');
            table.setAttribute('role', 'application');
            table.setAttribute('aria-label', 'Calendar');

            // Generate THEAD
            thead = document.createElement('thead');
            thead.appendChild(date_picker.getTheadOptions());
            table.appendChild(thead);

            // Generate TBODY
            tbody = document.createElement('tbody');
            tbody.appendChild(date_picker.getDays());
            table.appendChild(tbody);

            // ADD calendar to DOM
            date_picker.wrapper.appendChild(table);

            // Set position relative to event target
            evtpos = get_element_position(destInput);
            date_picker.wrapper.style.top = (evtpos[0] + parseInt(destInput.clientHeight, 10)) + 'px';
            date_picker.wrapper.style.left = evtpos[1] + 'px';

            date_picker.wrapper.style.display = 'block';

            // Make sure that calendar is always visible
            date_picker.checkPosition(date_picker.wrapper);

            // Event on document for hide calendar
            add_event(document, 'mousedown', date_picker.action);
            add_event(document, 'keydown', date_picker.action);

            // Create tabindex
            date_picker.set_tabindex(cal);
            date_picker.tabindex = 0;

            // Set focus on calendar
            if (is_host_object_property(date_picker.wrapper, 'focus')) {
                global.setTimeout(function () {
                    date_picker.wrapper.focus();
                }, 50);
            }
        },

        getTheadOptions : function () {
            var docFrag = document.createDocumentFragment(),
                tr,
                link,
                tdPrevMonth,
                thSelects,
                thNextMonth,
                select,
                option,
                year_from,
                year_to,
                inc,
                m,
                l,
                i,
                trD,
                thD,
                d;

            // Month and Year selector
            tr = document.createElement('tr');
            tr.setAttribute('role', 'presentation');

            // Previous
            tdPrevMonth = document.createElement('th');
            link = document.createElement('a');
            link.setAttribute('role', 'button');
            add_class(link, 'previousMonth');
            link.appendChild(document.createTextNode(config.previousMonth));
            tdPrevMonth.appendChild(link);
            tr.appendChild(tdPrevMonth);

            thSelects = document.createElement('th');
            thSelects.colSpan = 5;
            add_class(thSelects, 'thSelects');

            // MONTH: create <select>
            select = document.createElement('select');

            select.id = 'datepicker_select_month';
            select.name = 'datepicker_select_month';
            select.onchange = select.onkeydown = date_picker.getSelectedMonth;

            for (m = 0; m < 12; m += 1) {
                option = document.createElement('option');
                option.value = m + 1;
                option.appendChild(document.createTextNode(config.months[m]));

                // Set <option> to current selected month
                if (m === date_picker.selectedMonth) {
                    option.selected = 'selected';
                }

                select.appendChild(option);
            }
            thSelects.appendChild(select);

            // YEAR: create <select>

            select = document.createElement('select');
            select.id = 'datepicker_select_year';
            select.name = 'datepicker_select_year';
            select.onchange = select.onkeydown = date_picker.getSelectedYear;

            year_from = config.yearsFrom;
            year_to = (date_picker.selectedYear !== '') ? date_picker.selectedYear : get_current_date()[2]; // year from <select>-ed or get current year
            l = Math.abs(year_to - year_from);
            inc = (year_from > year_to) ? -1 : 1;

            for (i = 0; i <= l; i += 1) {
                option = document.createElement('option');
                option.value = year_from;
                option.appendChild(document.createTextNode(year_from));

                // Select current year option
                if (year_from === date_picker.selectedYear) {
                    option.selected = 'selected';
                }

                select.appendChild(option);
                year_from = year_from + inc;
            }

            thSelects.appendChild(select);

            // Complete two <select>-s
            tr.appendChild(thSelects);

            // NEXT MONTH option
            thNextMonth = document.createElement('th');
            link = document.createElement('a');
            link.setAttribute('role', 'button');
            add_class(link, 'nextMonth');
            link.appendChild(document.createTextNode(config.nextMonth));
            thNextMonth.appendChild(link);
            tr.appendChild(thNextMonth);

            docFrag.appendChild(tr);

            // DAYS
            trD = document.createElement('tr');
            add_class(trD, 'days');

            docFrag.appendChild(trD);

            for (d = 1; d < 8; d += 1) {
                thD = document.createElement('th');
                add_class(thD, 'day' + d);
                thD.appendChild(document.createTextNode(config.days[d - 1]));
                trD.appendChild(thD);
            }
            docFrag.appendChild(trD);

            return docFrag;
        },

        getSelectedMonth : function (e) {
            var tar = get_event_target(e),
                tbody;

            date_picker.selectedMonth = tar.options[tar.selectedIndex].value - 1;
            tbody = date_picker.wrapper.getElementsByTagName('tbody')[0];
            // clearing tbody
            remove_element_nodes(tbody);
            // get new tbody
            tbody.appendChild(date_picker.getDays());
        },

        getDays : function () {
            // Prepare TBODY
            var docFrag = document.createDocumentFragment(),
                currentDate,
                nextMonth,
                tr,
                td,
                a,
                day,
                weekDay,
                d,
                j;

            currentDate = Date.UTC(date_picker.selectedYear, date_picker.selectedMonth, 1);
            nextMonth = Date.UTC(date_picker.selectedYear, date_picker.selectedMonth + 1, 1);

            for (d = currentDate; d < nextMonth; d += 86400000) {
                day = new Date(d).getUTCDate();
                weekDay = new Date(d).getUTCDay();

                if (weekDay === 1) {
                    tr = document.createElement('tr');
                    docFrag.appendChild(tr);
                }

                if (weekDay !== 1 && day === 1) {
                    tr = document.createElement('tr');
                    docFrag.appendChild(tr);
                    for (j = 1; j < (weekDay || 7); j += 1) {
                        td = document.createElement('td');
                        add_class(td, 'empty');
                        tr.appendChild(td);
                    }
                }

                td = document.createElement('td');
                a = document.createElement('a');
                a.href = '#';
                a.setAttribute('role', 'button');
                a.appendChild(document.createTextNode(day));
                a.onclick = date_picker.no_action;

                if (day === config.currentDay && config.currentMonth === date_picker.selectedMonth && config.currentYear === date_picker.selectedYear) {
                    add_class(a, 'day today');
                    a.title = 'The selected day is today';
                    a.setAttribute('aria-selected', 'false');
                } else if (day === date_picker.fromInputDay && date_picker.fromInputMonth === date_picker.selectedMonth && date_picker.fromInputYear === date_picker.selectedYear) {
                    add_class(a, 'day selected');
                    a.title = 'The selected day is the day of the date field';
                    a.setAttribute('aria-selected', 'true');
                } else {
                    add_class(a, 'day ' + 'day' + weekDay);
                    a.setAttribute('aria-selected', 'false');
                }

                a.setAttribute('aria-label', day + ' ' + config.months[date_picker.selectedMonth] + ' ' + date_picker.selectedYear);

                td.appendChild(a);
                tr.appendChild(td);
            }

            while (weekDay && weekDay < 7) {
                td = document.createElement('td');
                add_class(td, 'day empty' + weekDay);
                weekDay += 1;
                tr.appendChild(td);
            }

            return docFrag;
        },

        getSelectedYear : function (e) {
            var tar = get_event_target(e),
                tbody;

            date_picker.selectedYear = tar.options[tar.selectedIndex].value;
            tbody = date_picker.wrapper.getElementsByTagName('tbody')[0];
            // clearing tbody
            remove_element_nodes(tbody);
            // get new tbody
            tbody.appendChild(date_picker.getDays());
        },

        checkPosition : function (d) {
            if (d.offsetWidth === 0) {
                return false;
                // nothing to do, because object has 0 width size
            }

            var viewport,
                scrollXY,
                pagesizeX,
                pagesizeY;

            // Get window sizes
            viewport = get_page_size();
            scrollXY = get_scroll_xy();

            // check horizontal position
            pagesizeX = (parseInt(viewport[2], 10) + parseInt(scrollXY[0], 10));
            // window width + window X scroll
            if (pagesizeX < (parseInt(d.offsetLeft, 10) + parseInt(d.offsetWidth, 10))) {
                d.style.left = (pagesizeX - parseInt(d.offsetWidth, 10) - 30) + 'px';
            }
            // check vertical position
            pagesizeY = (parseInt(viewport[3], 10) + parseInt(scrollXY[1], 10));
            // window height + window Y scroll
            if (pagesizeY < (parseInt(d.offsetTop, 10) + parseInt(d.offsetHeight, 10))) {
                d.style.top = (pagesizeY - parseInt(d.offsetHeight, 10) - 30) + 'px';
            }
            return true;
        },

        read : function (tar) {
            var gdate = tar.value,
                d;

            // If value have an date then get this date to set current day
            if (gdate.match(/(\d{1,2})[\w\W]{1}(\d{1,2})[\w\W]{1}(\d{4})/)) {
                // Check format dd-mm-yyyy
                d = new Date(gdate.replace(/(\d{1,2})[\w\W]{1}(\d{1,2})[\w\W]{1}(\d{4})/, '$3/$2/$1'));
                d.setDate(d.getDate());
                d.toLocaleString();

                date_picker.selectedDay = date_picker.fromInputDay = d.getDate();
                date_picker.selectedMonth = date_picker.fromInputMonth = d.getMonth();
                date_picker.selectedYear = date_picker.fromInputYear = d.getFullYear();
            } else if (gdate.match(/(\d{4})[\w\W]{1}(\d{1,2})[\w\W]{1}(\d{1,2})/)) {
                // Check format yyyy-mm-dd
                d = new Date(gdate.replace(/(\d{4})[\w\W]{1}(\d{1,2})[\w\W]{1}(\d{1,2})/, '$1/$2/$3'));
                d.setDate(d.getDate());
                d.toLocaleString();

                date_picker.selectedDay = date_picker.fromInputDay = d.getDate();
                date_picker.selectedMonth = date_picker.fromInputMonth = d.getMonth();
                date_picker.selectedYear = date_picker.fromInputYear = d.getFullYear();
            } else {
            // Get current day, if value is empty or invalid
                d = new Date();
                d.setDate(d.getDate());
                d.toLocaleString();

                date_picker.selectedDay = date_picker.fromInputDay = d.getDate();
                date_picker.selectedMonth = date_picker.fromInputMonth = d.getMonth();
                date_picker.selectedYear = date_picker.fromInputYear = d.getFullYear();
            }
        },

        get_keyboard_key : function (e) {
            return (e.type === 'keydown') ? e.charCode || e.keyCode || e.which : e.which || e.keyCode;
        },

        action : function (e) {
            var tar = get_event_target(e),
                input,
                parent,
                parentFind,
                table,
                thead,
                tbody;

            if (has_class(tar, 'nextMonth')) {
                // Next month
                date_picker.selectedMonth += 1;
            } else if (has_class(tar, 'previousMonth')) {
                // Previous month
                date_picker.selectedMonth -= 1;
            } else if (has_class(tar, 'day')) {
                // This is a day TD
                input = document.getElementById(date_picker.wrapper.input_id);
                date_picker.selectedDay = get_inner_text(tar);
                // PUT date to input field
                if (config.dateFormat === 'dd-mm-yyyy') {
                    input.value = (date_picker.selectedDay < 10 ? '0' : '') + date_picker.selectedDay + config.dateSeparator + (date_picker.selectedMonth < 9 ? '0' : '') + (1 + date_picker.selectedMonth) + config.dateSeparator + date_picker.selectedYear;
                } else {
                    input.value = date_picker.selectedYear + config.dateSeparator + (date_picker.selectedMonth < 9 ? '0' : '') + (1 + date_picker.selectedMonth) + config.dateSeparator + (date_picker.selectedDay < 10 ? '0' : '') + date_picker.selectedDay;
                }
                date_picker.hide();
                return false;
            }

            // Recalculate months and year
            if (date_picker.selectedMonth > 11) {
                date_picker.selectedYear += 1;
                date_picker.selectedMonth = 0;
            } else if (date_picker.selectedMonth < 0) {
                date_picker.selectedYear -= 1;
                date_picker.selectedMonth = 11;
            }

            // Check, where user clicked
            parent = tar;
            parentFind = false;

            while (parent.parentNode) {
                if (parent.id === 'smallcalendar') {
                    parentFind = true;
                    break;
                }
                parent = parent.parentNode;
            }

            // Refresh calendar content
            if (parentFind) {
                // Create new calendar content
                table = date_picker.wrapper.getElementsByTagName('table')[0];

                // get new thead and tbody, but if clicked <select> then only refresh tbody
                if (tar.nodeName.toLowerCase() !== 'select' && tar.nodeName.toLowerCase() !== 'option') {
                    remove_element_nodes(table);

                    thead = document.createElement('thead');
                    thead.appendChild(date_picker.getTheadOptions());
                    table.appendChild(thead);

                    tbody = document.createElement('tbody');
                    tbody.appendChild(date_picker.getDays());
                    table.appendChild(tbody);

                    date_picker.set_tabindex(table);
                    date_picker.tabindex = 0;
                }
            // or just close calendar because user clicked outside of calendar
            } else {
                date_picker.hide();
            }
        },

        no_action : function (e) {
            date_picker.cancelEvent(e);
        },

        set_tabindex : function (node) {
            if (!node) {
                return false;
            }

            var node_name = node.nodeName.toLowerCase();

            if (node_name === 'a' || node_name === 'select') {
                node.tabIndex = date_picker.tabindex;
                date_picker.tabindex += 1;
            }

            node = node.firstChild;
            while (node) {
                date_picker.set_tabindex(node);
                node = node.nextSibling;
            }
        },

        cancelEvent : function (e) {
            if (e && e.preventDefault) {
                e.preventDefault();
            }
            if (global.event) {
                global.event.returnValue = false;
            }
            return false;
        },

        hide : function () {
            remove_event(document, 'mousedown', date_picker.action);
            remove_event(document, 'keydown', date_picker.action);

            var calbox = document.getElementById('smallcalendar');
            calbox.style.display = 'none';
            remove_element_nodes(calbox);
        }
    };

    date_picker.init();

}(this));