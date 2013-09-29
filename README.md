# Datepicker

Simple date picker written in JavaScript - accessible, fast and no dependencies from 3rd party libraries.

## Usage

* Just add class name `datepicker` to HTML `input` element. Example: `<input class="datepicker" type="text" id="test" name="test" value=""/>`

## Configuration

Configuration are located in file `datepicker.js` where is section named `/* Config */`. There you have:
- _dateFormat_ - set your preffered date format 'dd-mm-yyyy' or 'yyyy-mm-dd'
- _currentDay_, _currentMonth_, _currentYear_ - specify current date by yourself, if you want
- _previousMonth_, _nextMonth_ - specify symbol for 'previous' and 'next' month button
- _days_, _month_ - arrays where are specified names of days and month in english by default
- _yearsFrom_ - from which year you want to start count in your `select` year HTML element
- _dateSeparator_ - used when date is passed to HTML `input` element; default is '-'
- _forceHTML5_ - set to `true` if you want to really use HTML5 date picker when available; by default is `false`

## Some TODO

- Navigation with keyboard doesn't work yet.
- Improving accessibility.
- Improving translations (Internationalization) by moving from local variable to JSON file.
- Optimizing code.

## License

Licensed under the MIT license.