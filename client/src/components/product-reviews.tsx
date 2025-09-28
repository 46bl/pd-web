import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, ThumbsUp, User, Verified } from 'lucide-react';
import { format } from 'date-fns';

interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductReviewsProps {
  productId: string;
  currentUserId?: string;
  onReviewAdded?: () => void;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

// Star Rating Component
const StarRating = ({ 
  rating, 
  editable = false, 
  onRatingChange,
  size = 'md' 
}: { 
  rating: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          } ${editable ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => editable && onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  );
};

export default function ProductReviews({ productId, currentUserId, onReviewAdded }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    title: '',
    comment: ''
  });

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
        
        // Check if current user has reviewed
        if (currentUserId) {
          const userReview = data.find((review: ProductReview) => review.userId === currentUserId);
          setHasUserReviewed(!!userReview);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, currentUserId]);

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ rating: 5, title: '', comment: '' });
        fetchReviews();
        onReviewAdded?.();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Mark review as helpful
  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchReviews(); // Refresh to show updated helpful count
      }
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-32 rounded"></div>
        <div className="animate-pulse bg-muted h-24 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          {currentUserId && !hasUserReviewed && (
            <Button
              onClick={() => setShowForm(!showForm)}
              variant="outline"
              size="sm"
            >
              Write a Review
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <StarRating rating={Math.round(averageRating)} size="lg" />
            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">
            ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      {/* Review Form */}
      {showForm && currentUserId && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="mt-1">
                  <StarRating
                    rating={formData.rating}
                    editable
                    onRatingChange={(rating) => setFormData({...formData, rating})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Review Title (Optional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Summarize your experience"
                />
              </div>
              
              <div>
                <Label htmlFor="comment">Your Review (Optional)</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  placeholder="Tell others about your experience with this product"
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted rounded-full p-2">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Anonymous User</span>
                        {review.isVerifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            <Verified className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}
                
                {review.comment && (
                  <p className="text-muted-foreground mb-3">{review.comment}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkHelpful(review.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful ({review.helpfulCount})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}