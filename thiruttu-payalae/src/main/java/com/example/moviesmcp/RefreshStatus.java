package com.example.moviesmcp;

public class RefreshStatus {
    private volatile String status = "idle";
    private volatile String message = "Not started";
    private volatile long startedAtEpochMs;
    private volatile long completedAtEpochMs;
    private volatile int lastUpserted;
    private volatile int totalRows;

    public synchronized void markRunning(String message) {
        this.status = "running";
        this.message = message;
        this.startedAtEpochMs = System.currentTimeMillis();
    }

    public synchronized void markCompleted(int upserted, int totalRows, String message) {
        this.status = "completed";
        this.lastUpserted = upserted;
        this.totalRows = totalRows;
        this.message = message;
        this.completedAtEpochMs = System.currentTimeMillis();
    }

    public synchronized void markFailed(String message) {
        this.status = "failed";
        this.message = message;
        this.completedAtEpochMs = System.currentTimeMillis();
    }

    public String status() {
        return status;
    }

    public String message() {
        return message;
    }

    public long startedAtEpochMs() {
        return startedAtEpochMs;
    }

    public long completedAtEpochMs() {
        return completedAtEpochMs;
    }

    public int lastUpserted() {
        return lastUpserted;
    }

    public int totalRows() {
        return totalRows;
    }
}
