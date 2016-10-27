# morphic-timeline

Interactive Timeline

Copyright (C) 2016 by Jörg Rade (joerg.rade60@gmail.com)

Inspired by Simile Timeline (http://www.simile-widgets.org/timeline/)
and based on charts.js by Jens Mönig (jens@moenig.org)

morphic-timeline is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

# Features
- displays events with start and end timestamp (TS) as horizontal bars
- events with a single TS (without duration) will be displayed as 'salino'
- allows for 'child' events, ie. events that have a parent event
- display of events of the same title can be toggled on/off

# Limitations
- events can either be parent or child - no grand children/grand parents allowed, only two 'generations'

# Open Issues
- how can the world scale to 100%, take the available area?
- checkboxes flat instead of 3d -> see: widgets.js, PushButtonMorph preferences settings for styling of ToggleMorph
- display links in popup's, invoke link on left click

- avoid v-scrollbar and use default 'scale'

# h-scrollbar / x-Axis
- scale x-axis according to passed in time scale, days, months, etc.
- have h-scrollbar as birds eye view
- assign thumbnail of complete graph
- set focus either on actual date or one passed in
- remove roundings -> HandleMorph

- allow for milestones <> without duration, currently 1 day
- use gradient to have a border around horizontal bars? -> LineMorph.prototype.linePath
- LineMorph.prototype.startStepping -> use world.hand.postion() for rider popup!

# Bugs
- Milestones are drawn twice for start and end! with an interconnection
