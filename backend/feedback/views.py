from rest_framework import viewsets, permissions
from .models import Feedback
from .serializers import FeedbackSerializer
from transactions.models import Transaction


def suggest_category(description, existing_category):
    """Simple keyword-based ML category suggestion."""
    desc = (description or '').lower()
    cat = (existing_category or '').lower()

    keyword_map = [
        (['taxi', 'grab', 'uber', 'bus', 'jeep', 'lrt', 'mrt', 'toll', 'gas', 'fuel', 'ride', 'transport', 'commute'], 'Transport'),
        (['mcdo', 'mcdonald', 'jollibee', 'kfc', 'pizza', 'burger', 'food', 'dining', 'restaurant', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'bakery', 'snack', 'eat'], 'Food & Dining'),
        (['hospital', 'clinic', 'doctor', 'medicine', 'pharma', 'drugstore', 'health', 'medical', 'checkup', 'dental', 'vitamins'], 'Health'),
        (['netflix', 'spotify', 'cinema', 'movie', 'game', 'steam', 'youtube', 'entertainment', 'concert', 'event', 'fun'], 'Entertainment'),
        (['tuition', 'school', 'university', 'book', 'education', 'course', 'training', 'seminar'], 'Education'),
        (['electric', 'water', 'internet', 'bill', 'utility', 'meralco', 'pldt', 'converge', 'rent', 'subscription'], 'Utilities'),
        (['mall', 'shop', 'lazada', 'shopee', 'amazon', 'clothes', 'shoes', 'accessories', 'gadget', 'iphone', 'laptop'], 'Shopping'),
    ]

    for keywords, category in keyword_map:
        for kw in keywords:
            if kw in desc:
                return category

    # If no keyword match, check existing category
    category_map = {
        'food': 'Food & Dining',
        'transport': 'Transport',
        'health': 'Health',
        'entertainment': 'Entertainment',
        'education': 'Education',
        'utilities': 'Utilities',
        'shopping': 'Shopping',
    }
    for k, v in category_map.items():
        if k in cat:
            return v

    return existing_category or 'Shopping'


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Auto-create Feedback for any expense transaction without one
        expense_transactions = Transaction.objects.filter(user=user, type='expense')
        existing_transaction_ids = set(
            Feedback.objects.filter(user=user).values_list('transaction_id', flat=True)
        )

        new_feedbacks = []
        for txn in expense_transactions:
            if txn.id not in existing_transaction_ids:
                suggested = suggest_category(txn.description, txn.category)
                new_feedbacks.append(Feedback(
                    user=user,
                    transaction=txn,
                    suggested_category=suggested,
                    is_confirmed=False,
                ))

        if new_feedbacks:
            Feedback.objects.bulk_create(new_feedbacks)

        return Feedback.objects.filter(user=user).order_by('-created_at')

    def perform_update(self, serializer):
        instance = serializer.save()
        # Propagate confirmed category back to the transaction
        if instance.is_confirmed and instance.confirmed_category:
            txn = instance.transaction
            txn.category = instance.confirmed_category
            txn.save()
