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
          <label for="eventTitle">Event Title</label>
          <input type="text" class="form-control" id="eventTitle">
        </div>
        <div class="form-group">
          <label for="eventStart">Start Time</label>
          <input type="datetime-local" class="form-control" id="eventStart">
        </div>
        <div class="form-group">
          <label for="eventEnd">End Time</label>
          <input type="datetime-local" class="form-control" id="eventEnd">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" id="deleteEvent">Delete</button>
        <button type="button" class="btn btn-primary" id="saveEvent">Save</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-success" id="createEvent" style="display: none;">Create</button>
      </div>
    </div>
  </div>
</div>


<div class="modal fade" id="editEventModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
      <div class="modal-content">
          <div class="modal-header">
              <h5 class="modal-title">Edit Event</h5>
              <button type="button" class="close" data-dismiss="modal">
                  <span>&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <input type="hidden" id="edit-event-id">
              <div class="form-group">
                  <label>Event Title</label>
                  <input type="text" class="form-control" id="edit-event-title">
              </div>
              <div class="form-group">
                  <label>Color</label>
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
              <button type="button" class="btn btn-success" id="save-edit-event">Update Changes</button>
          </div>
      </div>
  </div>
</div>