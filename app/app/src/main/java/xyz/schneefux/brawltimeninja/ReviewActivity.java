package xyz.schneefux.brawltimeninja;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;
import com.google.android.gms.tasks.Task;

public class ReviewActivity extends Activity {
  private static final String TAG = "ReviewActivity";
  private ReviewManager mReviewManager;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Log.d(TAG, "Review Activity started.");
    startReview();
  }

  public void startReview() {
    mReviewManager = ReviewManagerFactory.create(this);
    Log.d(TAG, "Requesting Review flow.");
    Task<ReviewInfo> request =
      mReviewManager.requestReviewFlow();
    request.addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        Log.d(TAG, "Review Flow request succeeded.");
        launchReviewFlow(task.getResult());
      } else {
        Log.d(TAG, "Review Flow request failed. Finishing.");
        finish();
      }
    });
  }

  private void launchReviewFlow(@NonNull ReviewInfo reviewInfo) {
    Log.d(TAG, "Launching review flow.");
    Task<Void> reviewFlow =
      mReviewManager.launchReviewFlow(this, reviewInfo);
    reviewFlow.addOnCompleteListener(task -> {
      Log.d(TAG, "Review flow finished. Finishing Activity.");
      finish();
    });
  }
}
