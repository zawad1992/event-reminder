<div class="modal fade" id="eventModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Event Details</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="eventType">Event Type <span class="required">*</span></label>
          <select class="form-control" id="eventType"></select>
        </div>
        <div class="form-group">
          <label for="eventTitle">Event Title <span class="required">*</span></label>
          <input type="text" class="form-control" id="eventTitle">
        </div>
        <div class="form-group">
          <label for="eventDescription">Description</label>
          <textarea class="form-control" id="eventDescription"></textarea>
        </div>
        <div class="form-group">
            <label for="eventStart">Start Time <span class="required">*</span></label>
            <div class="input-group date" id="startDatePicker" data-target-input="nearest">
                <input type="text" class="form-control datetimepicker-input" id="eventStart" data-target="#startDatePicker"/>
                <div class="input-group-append" data-target="#startDatePicker" data-toggle="datetimepicker">
                    <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="eventEnd">End Time <span class="required">*</span></label>
            <div class="input-group date" id="endDatePicker" data-target-input="nearest">
                <input type="text" class="form-control datetimepicker-input" id="eventEnd" data-target="#endDatePicker"/>
                <div class="input-group-append" data-target="#endDatePicker" data-toggle="datetimepicker">
                    <div class="input-group-text"><i class="fa fa-calendar"></i></div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between">
          <div class="custom-control custom-checkbox">
              <input class="custom-control-input custom-control-input-success" type="checkbox" id="eventAllDay">
              <label for="eventAllDay" class="custom-control-label" style="cursor: pointer">Is All Day?</label>
          </div>
          <div class="custom-control custom-checkbox">
              <input class="custom-control-input custom-control-input-danger" type="checkbox" id="eventReminder" checked>
              <label for="eventReminder" class="custom-control-label" style="cursor: pointer">Reminder?</label>
          </div>
        </div>
        <div class="custom-control custom-checkbox">
          <input class="custom-control-input custom-control-input-info" type="checkbox" id="eventRecurring">
          <label for="eventRecurring" class="custom-control-label" style="cursor: pointer">Recurring?</label>
        </div>
        <div class="custom-control custom-radio d-flex" id="recurringPeriodDiv">
          <div>
            <input class="custom-control-input custom-control-input-info recurring-type" type="radio" id="recurringType1" name="recurringType" value="1"  checked="">
            <label for="recurringType1" class="custom-control-label">Daily</label>
          </div>
          <div>
            <input class="custom-control-input custom-control-input-info recurring-type" type="radio" id="recurringType2" name="recurringType" value="2" >
            <label for="recurringType2" class="custom-control-label">Weekly</label>
          </div>
          <div>
            <input class="custom-control-input custom-control-input-info recurring-type" type="radio" id="recurringType3" name="recurringType" value="3" >
            <label for="recurringType3" class="custom-control-label">Monthly</label>
          </div>
          <div>
            <input class="custom-control-input custom-control-input-info recurring-type" type="radio" id="recurringType4" name="recurringType" value="4" >
            <label for="recurringType4" class="custom-control-label">Yearly</label>
          </div>
        </div>
        <div class="form-group" id="recurringCountDiv">
          <label for="recurringCount" class="mb-2">Recurring Count</label>
          <div class="input-group input-group-sm" style="width: 100px">
            <div class="input-group-prepend">
              <button type="button" class="btn btn-danger btn-sm btn-flat decrease" id="decreaseCount" style="padding: 0.25rem 0.5rem;">
                <i class="fas fa-minus fa-sm"></i>
              </button>
            </div>
            <input type="text" class="form-control form-control-sm text-center" id="recurringCount" value="1" min="1" max="100" readonly>
            <div class="input-group-append">
              <button type="button" class="btn btn-success btn-sm btn-flat increase" id="increaseCount" style="padding: 0.25rem 0.5rem;">
                <i class="fas fa-plus fa-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" id="deleteEvent">Delete</button>
        <button type="button" class="btn btn-success" id="updateEvent">Update</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="createEvent" style="display: none;">Create</button>
      </div>
    </div>
  </div>
</div>


<div class="modal fade" id="editEventTypeModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
      <div class="modal-content">
          <div class="modal-header">
              <h5 class="modal-title">Edit Event Type</h5>
              <button type="button" class="close" data-dismiss="modal">
                  <span>&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <input type="hidden" id="edit-event-id">
              <div class="form-group">
                  <label for="edit-event-title">Event Title</label>
                  <input type="text" class="form-control" id="edit-event-title">
              </div>
              <div class="form-group">
                  <label for="edit-event-title">Color</label>
                  <div class="btn-group">
                      <ul class="fc-color-picker" id="edit-color-chooser">
                          <li><a data-color="#3c8dbc" style="color: #3c8dbc" href="#"><i class="fas fa-square"></i></a></li>
                          <li><a data-color="#f39c12" style="color: #f39c12" href="#"><i class="fas fa-square"></i></a></li>
                          <li><a data-color="#00a65a" style="color: #00a65a" href="#"><i class="fas fa-square"></i></a></li>
                          <li><a data-color="#dd4b39" style="color: #dd4b39" href="#"><i class="fas fa-square"></i></a></li>
                          <li><a data-color="#6c757d" style="color: #6c757d" href="#"><i class="fas fa-square"></i></a></li>
                      </ul>
                  </div>
              </div>
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-success" id="update-event-type">Update Changes</button>
          </div>
      </div>
  </div>
</div>