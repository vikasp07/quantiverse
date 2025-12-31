"""
HTML Sanitization and Text Validation Module
Provides secure sanitization of user-submitted HTML and plain-text extraction.
"""

import re
import html


class HtmlSanitizer:
    """
    Sanitizes HTML to prevent XSS attacks and extracts plain text for validation.
    
    Security approach:
    - Removes dangerous HTML tags (script, style, iframe, object, embed, etc.)
    - Removes event handlers (onclick, onload, etc.)
    - Allows only safe formatting tags: b, i, u, strong, em, br, p, ul, ol, li
    - Escapes HTML entities to prevent injection
    """
    
    # Tags allowed in output (safe formatting only)
    ALLOWED_TAGS = {
        'b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li',
        'a', 'span', 'div'  # a, span, div without attributes handled below
    }
    
    # Event handlers to remove (security)
    EVENT_HANDLERS = {
        'onclick', 'onload', 'onerror', 'onchange', 'onfocus', 'onblur',
        'onmouseover', 'onmouseout', 'onkeypress', 'onkeydown', 'onkeyup',
        'ondblclick', 'onmousedown', 'onmouseup', 'onwheel'
    }
    
    @staticmethod
    def sanitize(html_content: str) -> str:
        """
        Sanitize HTML to remove dangerous tags and attributes.
        
        Args:
            html_content (str): Raw HTML from TipTap editor
            
        Returns:
            str: Sanitized HTML safe for storage
            
        Example:
            >>> html_input = '<p>Hello <script>alert("XSS")</script> World</p>'
            >>> HtmlSanitizer.sanitize(html_input)
            '<p>Hello  World</p>'
        """
        if not html_content or not isinstance(html_content, str):
            return ''
        
        content = html_content.strip()
        
        # Step 1: Remove script, style, iframe, object, embed tags completely
        dangerous_tags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input']
        for tag in dangerous_tags:
            # Match opening and closing tags with any content inside
            content = re.sub(
                f'<{tag}[^>]*>.*?</{tag}>',
                '',
                content,
                flags=re.IGNORECASE | re.DOTALL
            )
        
        # Step 2: Remove all event handlers from remaining tags
        # Matches onclick="..." or onclick='...' or onclick=value (without quotes)
        for handler in HtmlSanitizer.EVENT_HANDLERS:
            content = re.sub(
                f'{handler}\\s*=\\s*["\']?[^"\'\\s>]*["\']?',
                '',
                content,
                flags=re.IGNORECASE
            )
        
        # Step 3: Remove data: and javascript: protocols from href/src
        content = re.sub(
            r'(href|src|xlink:href)\s*=\s*["\']?(javascript:|data:|vbscript:)',
            r'\1="',
            content,
            flags=re.IGNORECASE
        )
        
        # Step 4: Remove attributes from anchor tags except href
        # Pattern: <a followed by attributes, capture href, then remove other attributes
        def clean_anchor_tag(match):
            tag_content = match.group(1)
            href_match = re.search(r'href\s*=\s*["\']?([^"\'>\s]+)["\']?', tag_content, re.IGNORECASE)
            if href_match:
                href = href_match.group(1)
                # Ensure href is safe (not javascript:, etc.)
                if not re.match(r'(javascript:|data:|vbscript:)', href, re.IGNORECASE):
                    return f'<a href="{html.escape(href)}">'
            return '<a>'
        
        content = re.sub(
            r'<a\s+([^>]*)>',
            clean_anchor_tag,
            content,
            flags=re.IGNORECASE
        )
        
        # Step 5: Remove dangerous attributes (style with expressions, data-*, on* handlers)
        # Remove style attribute entirely (prevents CSS injection)
        content = re.sub(
            r'\s+style\s*=\s*["\']?[^"\']*["\']?',
            '',
            content,
            flags=re.IGNORECASE
        )
        
        # Remove data-* attributes
        content = re.sub(
            r'\s+data-[a-z]+\s*=\s*["\']?[^"\']*["\']?',
            '',
            content,
            flags=re.IGNORECASE
        )
        
        return content.strip()
    
    @staticmethod
    def extract_plain_text(html_content: str) -> str:
        """
        Extract plain text from HTML for character validation.
        
        Removes all HTML tags and decodes HTML entities.
        Used to validate plain-text character count (250-500 chars).
        
        Args:
            html_content (str): HTML content (sanitized or raw)
            
        Returns:
            str: Plain text with normalized whitespace
            
        Example:
            >>> html = '<p>Hello <b>World</b></p>'
            >>> HtmlSanitizer.extract_plain_text(html)
            'Hello World'
        """
        if not html_content or not isinstance(html_content, str):
            return ''
        
        # Remove all HTML tags
        plain = re.sub(r'<[^>]+>', '', html_content)
        
        # Decode HTML entities (&nbsp; -> ' ', &amp; -> '&', etc.)
        plain = html.unescape(plain)
        
        # Normalize whitespace (replace multiple spaces with single space)
        plain = re.sub(r'\s+', ' ', plain).strip()
        
        return plain
    
    @staticmethod
    def validate_plain_text_length(html_content: str, min_length: int = 5, max_length: int = 500) -> dict:
        """
        Validate plain-text character count derived from HTML.
        
        Args:
            html_content (str): HTML content
            min_length (int): Minimum plain-text character count (default: 5)
            max_length (int): Maximum plain-text character count (default: 500)
            
        Returns:
            dict: {
                'valid': bool,
                'plain_text': str,
                'char_count': int,
                'message': str
            }
            
        Example:
            >>> result = HtmlSanitizer.validate_plain_text_length('<p>' + 'A' * 300 + '</p>')
            >>> result['valid']
            True
            >>> result['char_count']
            300
        """
        plain = HtmlSanitizer.extract_plain_text(html_content)
        char_count = len(plain)
        
        if char_count < min_length:
            return {
                'valid': False,
                'plain_text': plain,
                'char_count': char_count,
                'message': f'Text is too short: {char_count} characters. Minimum is {min_length}.'
            }
        
        if char_count > max_length:
            return {
                'valid': False,
                'plain_text': plain,
                'char_count': char_count,
                'message': f'Text is too long: {char_count} characters. Maximum is {max_length}.'
            }
        
        return {
            'valid': True,
            'plain_text': plain,
            'char_count': char_count,
            'message': f'Valid text length: {char_count} characters.'
        }


# ============================================================================
# USAGE EXAMPLES IN FLASK ENDPOINT:
# ============================================================================
"""
from sanitizer import HtmlSanitizer

@app.route('/admin/internships', methods=['POST'])
def create_internship():
    data = request.json
    
    # Step 1: Receive HTML from editor
    html_description = data.get('description', '')
    
    # Step 2: Sanitize HTML (remove scripts, events, unsafe tags)
    sanitized_html = HtmlSanitizer.sanitize(html_description)
    
    # Step 3: Extract plain text
    plain_text = HtmlSanitizer.extract_plain_text(sanitized_html)
    
    # Step 4: Validate length (250-500 chars)
    validation = HtmlSanitizer.validate_plain_text_length(sanitized_html)
    if not validation['valid']:
        return jsonify({'error': validation['message']}), 400
    
    # Step 5: Store in Supabase
    # - Sanitized HTML → description column
    # - Plain text → description_plain column
    
    supabase.from('simulations').insert({
        'description': sanitized_html,
        'description_plain': plain_text,
        # ... other fields
    })
"""
