-- Enable realtime on activities so the dashboard can receive live notification inserts.

ALTER PUBLICATION supabase_realtime ADD TABLE activities;
