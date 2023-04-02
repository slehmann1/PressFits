import math
import unittest

from pressfits.views import PressView


class TestPressView(unittest.TestCase):
    def test_is_positive_number(self):
        self.assertFalse(PressView.is_positive_number("JSDFJDLSF"))
        self.assertFalse(PressView.is_positive_number("Five"))
        self.assertFalse(PressView.is_positive_number(""))
        self.assertFalse(PressView.is_positive_number(" "))
        self.assertFalse(PressView.is_positive_number("-5"))
        self.assertFalse(PressView.is_positive_number(None))
        self.assertFalse(PressView.is_positive_number(0))
        self.assertFalse(PressView.is_positive_number(-1))
        self.assertTrue(PressView.is_positive_number(1))
        self.assertTrue(PressView.is_positive_number(0.1))
