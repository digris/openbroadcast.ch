from django.template import Context, Template

def wrap_text(instance, placeholder, rendered_content, original_context):
    '''
    This plugin processor wraps each plugin's output in a colored box if it is in the "main" placeholder.
    '''
    # Plugins not in the main placeholder should remain unchanged
    # Plugins embedded in Text should remain unchanged in order not to break output
    if (instance._render_meta.text_enabled and instance.parent):
        return rendered_content
    else:
        
        if 'column' in str(instance.plugin_type).lower():
            return rendered_content

        # For simplicity's sake, construct the template from a string:
        t = Template('<div class="' + str(instance.plugin_type).lower() + '_holder cmsplugin_holder">{{ content }}</div>')
        # Prepare that template's context:
        c = Context({
            'content': rendered_content,
        })
        # Finally, render the content through that template, and return the output

        print t.render(c)

        return t.render(c)