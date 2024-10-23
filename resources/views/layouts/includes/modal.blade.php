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