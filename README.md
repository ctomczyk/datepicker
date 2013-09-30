# Datepicker

Simple date picker written in JavaScript - accessible, fast and no dependencies from 3rd party libraries. Tested on: IE6-10, Firefox 24, Chrome 29.0.1547.76 m / all on Windows 7.

## Usage

Just add class name `datepicker` to HTML `input` element. Example: `<input class="datepicker" type="text" id="test" name="test" value=""/>`

**Note**: date picker is self initialized. This means that the code should be run in at least one of specified options:

- before closing `body` HTML tag
- when `DOMContentLoaded` event is called which means that the document has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading
- when `window.onload` event is called which means all resources and its dependent resources have finished loading

## Configuration

Configuration is located in file `datepicker.js` where is section named `/* Config */`. There you have:
- _dateFormat_ - set your preffered date format 'dd-mm-yyyy' or 'yyyy-mm-dd'
- _previousMonth_, _nextMonth_ - specify symbol for 'previous' and 'next' month button
- _days_, _month_ - arrays where are specified names of days and month in english by default
- _yearsFrom_ - from which year you want to start count in your `select` year HTML element; default is 2020
- _dateSeparator_ - used when date is passed to HTML `input` element; default is '-'
- _forceHTML5_ - set to `true` if you want to really use HTML5 date picker when available; by default is `false`

## Some TODO

- Navigation with keyboard doesn't work yet.
- Improving accessibility.
- Improving translations (Internationalization) by moving from local variable to JSON file.
- Optimizing code.

## License

Licensed under the MIT license.