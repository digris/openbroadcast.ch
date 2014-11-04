from django.db.models.manager import Manager

from roa.db.query import RemoteQuerySet


class ROAManager(Manager):
    """
    Manager which access remote resources.
    """
    use_for_related_fields = True
    is_roa_manager = True # ugly but useful because isinstance is evil

    def get_query_set(self):
        """
        Returns a QuerySet which access remote resources.
        """
        return RemoteQuerySet(self.model)

    def get_queryset(self):
        return RemoteQuerySet(self.model)

    def search(self, *args, **kwargs):
        return self.get_queryset().search(*args, **kwargs)
