/* "mouse" simple object by Hatscat

The MIT License (MIT)

Copyright (c) 2014 Lucien Boudy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function ()
{
	var m = {
		e: null,
		x: 0,
		y: 0,
		oldX: 0,
		oldY: 0,
		moveX: 0,
		moveY: 0,
		pressed: false,
		doubleClicks: false,
		target: { x:0, y:0 }
	}	
	window.onmousemove = function (e)
	{
		m.e = e;
		m.oldX = m.x;
		m.oldY = m.y;
		m.x = e.x;
		m.y = e.y;
		m.moveX = m.x == m.oldX ? 0 : m.x < m.oldX ? -1 : 1;
		m.moveY = m.y == m.oldY ? 0 : m.y < m.oldY ? -1 : 1;
	}
	window.onmousedown = function (e)
	{
		m.e = e;
		m.pressed = true;
		m.target.x = e.x;
		m.target.y = e.y;
	}
	window.onmouseup = function (e)
	{
		m.e = e;
		m.pressed = false;
	}
	window.ondblclick = function (e)
	{
		m.e = e;
		m.doubleClicks = true;
	}
	window.mouse = m;
})()
